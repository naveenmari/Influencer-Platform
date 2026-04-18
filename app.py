from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import os

load_dotenv()
from functools import wraps
from flask_cors import CORS

from flask.json.provider import DefaultJSONProvider
import datetime
from decimal import Decimal

class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

app = Flask(__name__)
app.json = CustomJSONProvider(app)
app.secret_key = 'your_secret_key_here'  # Change this for production!
CORS(app) # Enable CORS for all routes

import os
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads', 'profile_pics')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database Configuration

def get_db_connection():
    try:
        import os
        database_url = os.environ.get("DATABASE_URL")
        conn = psycopg2.connect(database_url, sslmode='require')
        return conn
    except psycopg2.Error as err:
        print(f"Error connecting to database: {err}")
        return None

# --- Helpers ---
def login_required(role=None):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                flash("Please log in to access this page.", "warning")
                return redirect(url_for('login'))
            if role and session.get('role') != role:
                flash("Unauthorized access!", "danger")
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function
    return wrapper

# --- Routes ---

@app.route('/')
def index():
    return render_template('index.html')

# --- API Routes for React Frontend ---

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            # Check if user exists
            cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", (email, username))
            user = cursor.fetchone()
            if user:
                return jsonify({'error': 'User already exists!'}), 400
            else:
                # Insert new user
                cursor.execute("INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s)", 
                               (username, email, password, role))
                conn.commit()
                return jsonify({'message': 'Registration successful!'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()
    return jsonify({'error': 'Database connection failed'}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user and user['password_hash'] == password:
            # Check if profile exists
            profile = None
            if user['role'] == 'brand':
                cursor.execute("SELECT * FROM brands WHERE user_id = %s", (user['id'],))
                profile = cursor.fetchone()
            elif user['role'] == 'influencer':
                cursor.execute("SELECT * FROM influencers WHERE user_id = %s", (user['id'],))
                profile = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'role': user['role'],
                    'profile_pic_url': user.get('profile_pic_url'),
                    'profile_completed': bool(profile)
                }
            }), 200
        else:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Invalid email or password'}), 401
    return jsonify({'error': 'Database connection failed'}), 500

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    # In a real app, use token based auth (JWT). For now, we will trust the client to send user_id/role in headers or params for demo simplicity 
    # OR we can assume session if we share cookies (requires credentials: include in fetch).
    # Since we are moving to stateless API, let's accept user_id and role as query params for this simple migration.
    
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    
    if not user_id or not role:
        return jsonify({'error': 'Missing user_id or role'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    data = {}
    
    if role == 'brand':
        cursor.execute("SELECT id FROM brands WHERE user_id = %s", (user_id,))
        brand = cursor.fetchone()
        if brand:
            # Active Campaigns
            cursor.execute("SELECT * FROM campaigns WHERE brand_id = %s", (brand['id'],))
            campaigns = cursor.fetchall()
            
            # Pending Requests count
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM ad_requests ar 
                JOIN campaigns c ON ar.campaign_id = c.id 
                WHERE c.brand_id = %s AND ar.status = 'pending'
            """, (brand['id'],))
            pending_requests = cursor.fetchone()['count']
            
            # Total Spent
            total_spent = sum([float(c['budget']) for c in campaigns if c['budget']])
            
            data = {
                'stats': [
                    {'label': 'Active Campaigns', 'value': str(len(campaigns))},
                    {'label': 'Total Spent', 'value': f"${total_spent:,.0f}"},
                    {'label': 'Pending Requests', 'value': str(pending_requests)}
                ],
                'campaigns': campaigns
            }
            
            # Fetch Influencers
            cursor.execute("""
                SELECT i.*, u.username, u.email, u.profile_pic_url,
                       (SELECT COALESCE(AVG(rating), 0) FROM influencer_reviews WHERE influencer_id = i.id) as average_rating,
                       (SELECT COUNT(*) FROM influencer_reviews WHERE influencer_id = i.id) as review_count
                FROM influencers i 
                JOIN users u ON i.user_id = u.id
            """)
            import random
            enriched_influencers = []
            for inf in cursor.fetchall():
                # Add mock data for missing fields to ensure premium look
                inf['followers'] = random.randint(50000, 1500000)
                inf['engagement'] = round(random.uniform(2.5, 9.5), 1)
                inf['price'] = f"${random.randint(200, 800)} - ${random.randint(900, 2500)}"
                inf['location'] = random.choice(['Paris, France', 'London, UK', 'Dubai, UAE', 'Tokyo, Japan', 'Berlin, Germany'])
                enriched_influencers.append(inf)
            
            data['influencers'] = enriched_influencers
            
    elif role == 'influencer':
        cursor.execute("SELECT id FROM influencers WHERE user_id = %s", (user_id,))
        influencer = cursor.fetchone()
        if influencer:
             # Applications
            cursor.execute("""
                SELECT ar.*, c.title as campaign_title, c.budget, c.status as campaign_status, b.company_name
                FROM ad_requests ar 
                JOIN campaigns c ON ar.campaign_id = c.id 
                JOIN brands b ON c.brand_id = b.id
                WHERE ar.influencer_id = %s
            """, (influencer['id'],))
            applications = cursor.fetchall()
            
            data = {
                'stats': [
                    {'label': 'Applications Sent', 'value': str(len(applications))},
                    {'label': 'Accepted', 'value': str(len([a for a in applications if a['status'] == 'accepted']))},
                    {'label': 'Pending', 'value': str(len([a for a in applications if a['status'] == 'pending']))}
                ],
                'applications': applications
            }

            # Fetch Platforms and Follower Counts
            cursor.execute("SELECT * FROM influencer_platforms WHERE influencer_id = %s", (influencer['id'],))
            data['platforms'] = cursor.fetchall()
             
             # Fetch Campaigns to Apply
            cursor.execute("""
                SELECT c.*, b.company_name 
                FROM campaigns c 
                JOIN brands b ON c.brand_id = b.id 
                WHERE c.status = 'active'
            """)
            data['campaigns'] = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(data), 200

@app.route('/api/campaigns', methods=['POST'])
def api_create_campaign():
    data = request.json
    user_id = data.get('user_id') # In real app, get from token
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cursor.execute("SELECT id FROM brands WHERE user_id = %s", (user_id,))
        brand = cursor.fetchone()
        
        if brand:
            cursor.execute("""
                INSERT INTO campaigns (brand_id, title, description, budget, start_date, end_date, target_platform, deliverables, deadline)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (brand['id'], data['title'], data['description'], data['budget'], data['start_date'], data['end_date'], data['target_platform'], data.get('deliverables'), data.get('deadline')))
            conn.commit()
            return jsonify({'message': 'Campaign created successfully!'}), 201
        else:
             return jsonify({'error': 'Brand not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/campaigns/<int:campaign_id>', methods=['GET', 'PUT', 'DELETE'])
def api_campaign_operations(campaign_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        try:
            cursor.execute("""
                SELECT c.*, b.company_name, b.industry, b.user_id as brand_user_id 
                FROM campaigns c 
                JOIN brands b ON c.brand_id = b.id 
                WHERE c.id = %s
            """, (campaign_id,))
            campaign = cursor.fetchone()
            
            if campaign:
                if user_id:
                    cursor.execute("SELECT id FROM influencers WHERE user_id = %s", (user_id,))
                    inf = cursor.fetchone()
                    if inf:
                        cursor.execute("SELECT status FROM ad_requests WHERE campaign_id = %s AND influencer_id = %s", (campaign_id, inf['id']))
                        req = cursor.fetchone()
                        if req:
                            campaign['application_status'] = req['status']
                        
                        # Check payment status
                        cursor.execute("SELECT status FROM payments_invoices WHERE campaign_id = %s AND influencer_id = %s", (campaign_id, user_id))
                        pay = cursor.fetchone()
                        if pay:
                            campaign['payment_status'] = pay['status']
                        else:
                            campaign['payment_status'] = None
                return jsonify(campaign), 200
            else:
                return jsonify({'error': 'Campaign not found'}), 404
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'PUT':
        data = request.json
        try:
            # Basic validation could be added here
            cursor.execute("""
                UPDATE campaigns 
                SET title = %s, description = %s, budget = %s, start_date = %s, end_date = %s, status = %s, deliverables = %s, deadline = %s
                WHERE id = %s
            """, (data['title'], data['description'], data['budget'], data['start_date'], data['end_date'], data['status'], data.get('deliverables'), data.get('deadline'), campaign_id))
            conn.commit()
            return jsonify({'message': 'Campaign updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'DELETE':
        try:
            cursor.execute("DELETE FROM campaigns WHERE id = %s", (campaign_id,))
            conn.commit()
            return jsonify({'message': 'Campaign deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

@app.route('/api/campaigns/<int:campaign_id>/requests', methods=['GET'])
def api_get_campaign_requests(campaign_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # First get the campaign's target platform
        cursor.execute("SELECT target_platform FROM campaigns WHERE id = %s", (campaign_id,))
        campaign = cursor.fetchone()
        
        target_platform = campaign['target_platform'] if campaign else None

        # Fetch requests with follower count for THAT platform
        query = """
            SELECT ar.*, i.category, i.niche, u.username, u.email, u.id as user_id,
                   COALESCE(ip.follower_count, 0) as platform_followers,
                   COALESCE(ip.platform_name, 'N/A') as platform_name
            FROM ad_requests ar
            JOIN influencers i ON ar.influencer_id = i.id
            JOIN users u ON i.user_id = u.id
            LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id AND ip.platform_name = %s
            WHERE ar.campaign_id = %s
        """
        cursor.execute(query, (target_platform, campaign_id))
        requests = cursor.fetchall()
        return jsonify(requests), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/ad_requests/<int:request_id>', methods=['PUT'])
def api_update_ad_request(request_id):
    data = request.json
    status = data.get('status')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cursor.execute("UPDATE ad_requests SET status = %s WHERE id = %s", (status, request_id))
        conn.commit()
        return jsonify({'message': 'Request updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/ad_requests', methods=['POST'])
def api_ad_requests():
    data = request.json
    campaign_id = data.get('campaign_id')
    user_id = data.get('user_id') # This is the user_id of the influencer applying
    message = data.get('message', '')
    requirements = data.get('requirements', '')
    payment_amount = data.get('payment_amount', 0)

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Get influencer_id from user_id
        cursor.execute("SELECT id FROM influencers WHERE user_id = %s", (user_id,))
        influencer = cursor.fetchone()
        
        if not influencer:
            return jsonify({'error': 'Influencer profile not found'}), 404
        
        # Check if already applied
        cursor.execute("SELECT * FROM ad_requests WHERE campaign_id = %s AND influencer_id = %s", (campaign_id, influencer['id']))
        existing_request = cursor.fetchone()
        
        if existing_request:
            return jsonify({'error': 'You have already applied to this campaign'}), 400

        cursor.execute("""
            INSERT INTO ad_requests (campaign_id, influencer_id, message, requirements, payment_amount, status)
            VALUES (%s, %s, %s, %s, %s, 'pending')
        """, (campaign_id, influencer['id'], message, requirements, payment_amount))
        
        conn.commit()
        return jsonify({'message': 'Application submitted successfully'}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/create_profile', methods=['POST'])
def api_create_profile():
    data = request.json
    user_id = data.get('user_id')
    role = data.get('role')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if role == 'brand':
            company_name = data.get('company_name')
            industry = data.get('industry')
            description = data.get('description')
            cursor.execute("INSERT INTO brands (user_id, company_name, industry, description) VALUES (%s, %s, %s, %s)",
                           (user_id, company_name, industry, description))
        elif role == 'influencer':
            category = data.get('category')
            niche = data.get('niche')
            language = data.get('language', 'English')
            portfolio_url = data.get('portfolio_url')
            country = data.get('country')
            platforms = data.get('platforms', [])
            
            # Insert into influencers table
            cursor.execute("INSERT INTO influencers (user_id, category, niche, language, portfolio_url, country) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                           (user_id, category, niche, language, portfolio_url, country))
            
            # Get the new influencer_id
            influencer_id = cursor.fetchone()[0]
            
            # Insert platforms
            for platform in platforms:
                platform_name = platform.get('platform_name')
                follower_count = platform.get('follower_count')
                username = platform.get('username')
                url = platform.get('url')
                
                if platform_name:
                    cursor.execute("INSERT INTO influencer_platforms (influencer_id, platform_name, follower_count, username, url) VALUES (%s, %s, %s, %s, %s)",
                                   (influencer_id, platform_name, follower_count or 0, username, url))
        
        conn.commit()
        return jsonify({'message': 'Profile created successfully!'}), 201
    except psycopg2.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/profile', methods=['GET'])
def api_get_profile():
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    
    if not user_id or not role:
        return jsonify({'error': 'Missing parameters'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        if role == 'influencer':
            cursor.execute("SELECT * FROM influencers WHERE user_id = %s", (user_id,))
            profile = cursor.fetchone()
            if profile:
                cursor.execute("SELECT * FROM influencer_platforms WHERE influencer_id = %s", (profile['id'],))
                profile['platforms'] = cursor.fetchall()
            return jsonify(profile or {}), 200
        elif role == 'brand':
            cursor.execute("SELECT * FROM brands WHERE user_id = %s", (user_id,))
            return jsonify(cursor.fetchone() or {}), 200
    except psycopg2.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/profile', methods=['PUT'])
def api_update_profile():
    data = request.json
    user_id = data.get('user_id')
    role = data.get('role')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if role == 'influencer':
            cursor.execute("""
                UPDATE influencers 
                SET category = %s, niche = %s, language = %s, portfolio_url = %s, bio = %s, country = %s
                WHERE user_id = %s
            """, (data.get('category'), data.get('niche'), data.get('language'), data.get('portfolio_url'), data.get('bio'), data.get('country'), user_id))
            conn.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
    except psycopg2.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/upload_profile_pic', methods=['POST'])
def api_upload_profile_pic():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    user_id = request.form.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        import uuid
        filename = f"{user_id}_{uuid.uuid4().hex}.webp" 
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Ensure directory exists (already done in app config, but safe check)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        file.save(file_path)
        
        # relative path for web access
        profile_pic_url = f"/static/uploads/profile_pics/{filename}"
        
        # Update database
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE users SET profile_pic_url = %s WHERE id = %s", (profile_pic_url, user_id))
            conn.commit()
            return jsonify({'message': 'Profile picture uploaded successfully', 'profile_pic_url': profile_pic_url}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/forgot_password', methods=['POST'])
def api_forgot_password():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    # In a real application, you would:
    # 1. Check if email exists in DB
    # 2. Generate a reset token
    # 3. Send email with reset link
    # For this demo, we will simulate success if email format is valid
    
    return jsonify({'message': 'If an account exists for this email, a password reset link has been sent.'}), 200

@app.route('/api/update_platform_details', methods=['POST'])
def api_update_platform_details():
    data = request.json
    platform_id = data.get('id')
    follower_count = data.get('follower_count')
    username = data.get('username')
    url = data.get('url')
    
    if not platform_id:
        return jsonify({'error': 'Platform ID is required'}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build dynamic update query
        fields = []
        values = []
        
        if follower_count is not None:
            fields.append("follower_count = %s")
            values.append(follower_count)
            
        if username is not None:
            fields.append("username = %s")
            values.append(username)
            
        if url is not None:
            fields.append("url = %s")
            values.append(url)
            
        if not fields:
             return jsonify({'message': 'No changes provided'}), 200
             
        values.append(platform_id)
        query = f"UPDATE influencer_platforms SET {', '.join(fields)} WHERE id = %s"
        
        cursor.execute(query, tuple(values))
        conn.commit()
        
        return jsonify({'message': 'Details updated successfully'}), 200
    except psycopg2.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/leaderboard', methods=['GET'])
def api_leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Rank by Campaigns Completed (accepted requests) and Total Followers
        query = """
            SELECT 
                i.id, i.category, i.niche,
                u.username, u.profile_pic_url,
                (SELECT COUNT(*) FROM ad_requests ar WHERE ar.influencer_id = i.id AND ar.status = 'accepted') as campaigns_completed,
                (SELECT COALESCE(SUM(follower_count), 0) FROM influencer_platforms ip WHERE ip.influencer_id = i.id) as total_followers,
                (SELECT COALESCE(AVG(rating), 0) FROM influencer_reviews WHERE influencer_id = i.id) as average_rating,
                (SELECT COUNT(*) FROM influencer_reviews WHERE influencer_id = i.id) as review_count
            FROM influencers i
            JOIN users u ON i.user_id = u.id
            ORDER BY campaigns_completed DESC, total_followers DESC
        """
        cursor.execute(query)
        leaderboard = cursor.fetchall()
        
        return jsonify(leaderboard), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/ai_match', methods=['POST'])
def api_ai_match():
    data = request.json
    target_category = data.get('category')
    target_platform = data.get('platform')
    target_location = data.get('location')
    min_followers_str = data.get('followers')
    
    # Parse min followers
    min_followers = 0
    if min_followers_str:
        if 'k' in min_followers_str.lower():
            min_followers = int(min_followers_str.lower().replace('k', '')) * 1000
        elif 'm' in min_followers_str.lower():
            min_followers = int(float(min_followers_str.lower().replace('m', '')) * 1000000)

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Fetch all influencers with their platform data
        query = """
            SELECT 
                i.id, i.category, i.niche,
                u.username, u.email, u.profile_pic_url,
                ip.platform_name, ip.follower_count, ip.url, ip.username as platform_handle,
                (SELECT COALESCE(AVG(rating), 0) FROM influencer_reviews WHERE influencer_id = i.id) as db_average_rating,
                (SELECT COUNT(*) FROM influencer_reviews WHERE influencer_id = i.id) as db_review_count
            FROM influencers i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Process and Score
        influencer_scores = {}
        
        import random
        
        for row in rows:
            inf_id = row['id']
            
            if inf_id not in influencer_scores:
                # Mock Data Generation for "AI" features not in DB
                # In a real app, these would come from external APIs or DB
                mock_engagement = round(random.uniform(1.5, 8.5), 1) 
                mock_location = random.choice(['USA', 'UK', 'Canada', 'India', 'Global', 'Australia'])
                
                influencer_scores[inf_id] = {
                    'id': inf_id,
                    'name': row['username'],
                    'category': row['category'],
                    'handle': row['platform_handle'] or ('@' + row['username']),
                    'matchScore': 0,
                    'followers': 0,
                    'platform': row['platform_name'] or 'General',
                    'image': f"http://localhost:5000{row['profile_pic_url']}" if row['profile_pic_url'] else f"https://ui-avatars.com/api/?name={row['username']}&background=random",
                    'engagement_rate': mock_engagement,
                    'location': mock_location,
                    'url': row['url'] if row['url'] else None,
                    'average_rating': row['db_average_rating'],
                    'review_count': row['db_review_count']
                }
            
            # Aggregate max followers if multiple platforms
            if row['follower_count'] and row['follower_count'] > influencer_scores[inf_id]['followers']:
                influencer_scores[inf_id]['followers'] = row['follower_count']
                influencer_scores[inf_id]['platform'] = row['platform_name']
                if row['platform_handle']:
                     influencer_scores[inf_id]['handle'] = row['platform_handle']
                if row['url']:
                     influencer_scores[inf_id]['url'] = row['url']

            # --- WEIGHTED SCORING ALGORITHM ---
            score = 0
            
            # 1. Niche/Category Similarity (35%)
            if target_category and row['category']:
                if target_category.lower() == row['category'].lower():
                    score += 35
                elif target_category.lower() in row['category'].lower():
                    score += 25
            
            # 2. Platform Presence (20%)
            if target_platform and row['platform_name']: 
                if target_platform.lower() == row['platform_name'].lower():
                    score += 20
                
            # 3. Follower Range (15%)
            if row['follower_count'] and row['follower_count'] >= min_followers:
                score += 15
            
            # 4. Engagement Rate (20%) - Higher is better
            # Using mock data: > 5% is excellent, > 3% is good
            eng_rate = influencer_scores[inf_id]['engagement_rate']
            if eng_rate >= 5.0:
                score += 20
            elif eng_rate >= 3.0:
                score += 10
            elif eng_rate >= 1.5:
                score += 5

            # 5. Audience Location (10%)
            # Using mock data
            loc = influencer_scores[inf_id]['location']
            if target_location and target_location.lower() in loc.lower():
                score += 10
            elif not target_location or target_location.lower() == 'global':
                 score += 5 # Default points if no location interaction

            # Add to existing score (keep max if looping platforms, or accumulate logic)
            # Here we take the max score achieved across their platforms/row entries
            influencer_scores[inf_id]['matchScore'] = max(influencer_scores[inf_id]['matchScore'], score)

        # Final List Processing
        results = []
        for inf in influencer_scores.values():
            # Add small random variance (0-5) to simulate "AI analysis"
            inf['matchScore'] += random.randint(0, 5)
            if inf['matchScore'] > 100: inf['matchScore'] = 100
            
            # Format followers
            num = inf['followers']
            if num >= 1000000:
                inf['formatted_followers'] = f"{num/1000000:.1f}M"
            elif num >= 1000:
                inf['formatted_followers'] = f"{num/1000:.0f}K"
            else:
                inf['formatted_followers'] = str(num)
            
            # Only return relevant results (e.g., score > 30)
            if inf['matchScore'] > 30:
                results.append(inf)

        # Sort by score descending
        results.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return jsonify(results[:6]), 200 # Return top 6
        
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/search', methods=['POST'])
def api_search_influencers():
    data = request.json
    platform = data.get('platform')
    niche = data.get('niche')
    language = data.get('language')
    location = data.get('location')
    min_followers = data.get('min_followers', 0)
    sort_by = data.get('sort_by', 'followers') # followers, rating, engagement
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Build dynamic query
        query = """
            SELECT 
                i.id, i.user_id, i.category, i.niche, i.language, i.verification_status, i.portfolio_url,
                u.username, u.profile_pic_url,
                ip.platform_name, ip.follower_count, ip.url, ip.username as platform_handle,
                (SELECT COALESCE(AVG(rating), 0) FROM influencer_reviews WHERE influencer_id = i.id) as average_rating,
                (SELECT COUNT(*) FROM influencer_reviews WHERE influencer_id = i.id) as review_count
            FROM influencers i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
            WHERE 1=1
        """
        params = []
        
        if niche:
            query += " AND i.niche LIKE %s"
            params.append(f"%{niche}%")
        if language:
            query += " AND i.language = %s"
            params.append(language)
        if platform and platform != 'All' and platform != '':
            query += " AND ip.platform_name = %s"
            params.append(platform)
        if min_followers:
            query += " AND ip.follower_count >= %s"
            params.append(int(min_followers))
            
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        # Deduplicate by influencer id (taking highest follower count)
        influencers_dict = {}
        for row in rows:
            inf_id = row['id']
            if inf_id not in influencers_dict or (row['follower_count'] and row['follower_count'] > influencers_dict[inf_id]['followers']):
                import random
                mock_engagement = round(random.uniform(1.5, 8.5), 1)
                mock_location = random.choice(['USA', 'UK', 'Canada', 'India', 'Global', 'Australia'])
                row['engagement_rate'] = mock_engagement
                row['location'] = mock_location
                row['followers'] = row['follower_count'] or 0
                influencers_dict[inf_id] = row
                
        results = list(influencers_dict.values())
        
        # Simple Location filter on mock data
        if location and location.lower() not in ['global', 'all', 'any', 'none', '']:
            results = [r for r in results if location.lower() in r['location'].lower()]
            
        # Sorting
        if sort_by == 'rating':
            results.sort(key=lambda x: x['average_rating'], reverse=True)
        elif sort_by == 'engagement':
            results.sort(key=lambda x: x['engagement_rate'], reverse=True)
        else:
            results.sort(key=lambda x: x['followers'], reverse=True)
            
        # Format numbers for frontend
        for inf in results:
            num = inf['followers']
            if num >= 1000000:
                inf['formatted_followers'] = f"{num/1000000:.1f}M"
            elif num >= 1000:
                inf['formatted_followers'] = f"{num/1000:.0f}K"
            else:
                inf['formatted_followers'] = str(num)
                
            inf['image'] = f"http://localhost:5000{inf['profile_pic_url']}" if inf['profile_pic_url'] else f"https://ui-avatars.com/api/?name={inf['username']}&background=random"

        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Admin API Routes ---

def verify_admin(user_id):
    if not user_id: return False
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user and user['role'] == 'admin'

@app.route('/api/admin/stats', methods=['GET'])
def api_admin_stats():
    user_id = request.args.get('user_id')
    if not verify_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT COUNT(*) as total FROM users")
        user_count = cursor.fetchone()['total']
        cursor.execute("SELECT COUNT(*) as total FROM brands")
        brand_count = cursor.fetchone()['total']
        cursor.execute("SELECT COUNT(*) as total FROM influencers")
        influencer_count = cursor.fetchone()['total']
        cursor.execute("SELECT COUNT(*) as total FROM campaigns")
        campaign_count = cursor.fetchone()['total']
        
        return jsonify({
            'users': user_count,
            'brands': brand_count,
            'influencers': influencer_count,
            'campaigns': campaign_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/users', methods=['GET'])
def api_admin_users():
    user_id = request.args.get('user_id')
    if not verify_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id, username, email, password_hash, role, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/campaigns', methods=['GET'])
def api_admin_campaigns():
    user_id = request.args.get('user_id')
    if not verify_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Fetching campaigns along with the brand company name
        cursor.execute("""
            SELECT c.id, c.title, c.budget, c.status, c.target_platform, b.company_name 
            FROM campaigns c 
            JOIN brands b ON c.brand_id = b.id 
            ORDER BY c.id DESC
        """)
        campaigns = cursor.fetchall()
        return jsonify(campaigns), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/verify', methods=['POST'])
def api_admin_verify():
    data = request.json
    password = data.get('password')
    user_id = data.get('user_id')
    
    if not verify_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if user and user['password_hash'] == password: 
            return jsonify({'success': True}), 200
        return jsonify({'error': 'Invalid admin password'}), 401
    finally:
        cursor.close()
        conn.close()

# --- Admin Verification API Routes ---
@app.route('/api/admin/verifications', methods=['GET'])
def api_admin_verifications():
    user_id = request.args.get('user_id')
    if not verify_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT i.id, i.category, i.niche, i.verification_status, i.portfolio_url, u.username, u.email
            FROM influencers i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.verification_status ASC, u.created_at DESC
        """)
        influencers = cursor.fetchall()
        
        # Simple Fraud Analysis Mock
        import random
        for inf in influencers:
            if random.random() > 0.8:
                inf['fraud_risk'] = 'High'
                inf['fraud_reason'] = 'Suspicious follower growth spikes'
            else:
                inf['fraud_risk'] = 'Low'
                inf['fraud_reason'] = 'Normal activity patterns'
                
        return jsonify(influencers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/verify/<int:influencer_id>', methods=['PUT'])
def api_admin_verify_influencer(influencer_id):
    data = request.json
    user_id = data.get('user_id')
    status = data.get('status', 'verified')
    
    if not verify_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("UPDATE influencers SET verification_status = %s WHERE id = %s", (status, influencer_id))
        conn.commit()
        return jsonify({'message': f'Influencer marked as {status}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Trend Analysis API Routes ---

@app.route('/api/trends', methods=['GET'])
def api_trends():
    platform = request.args.get('platform', 'all')
    time_range = request.args.get('time_range', '7d')
    industry = request.args.get('industry', 'all')
    
    # Mock data generation based on filters
    trend_data = {
        'top_hashtags': [
            {'tag': '#TechTrends2026', 'volume': '2.1M'},
            {'tag': '#SustainableFashion', 'volume': '1.8M'},
            {'tag': '#AILife', 'volume': '1.5M'},
            {'tag': '#FitnessMotivation', 'volume': '1.2M'},
            {'tag': '#Wanderlust', 'volume': '900K'},
            {'tag': '#CreatorEconomy', 'volume': '850K'},
            {'tag': '#FutureOfWork', 'volume': '700K'}
        ],
        'viral_topics': [
            'AI wearable devices review',
            '10-minute home workouts',
            'Minimalist travel packing',
            'Sustainable clothing hauls',
            'Day in the life of a digital nomad'
        ],
        'category_popularity': [
            {'category': 'Tech', 'value': 85},
            {'category': 'Fashion', 'value': 75},
            {'category': 'Fitness', 'value': 65},
            {'category': 'Travel', 'value': 55},
            {'category': 'Food', 'value': 70}
        ],
        'growth_trends': [
            {'date': 'Mon', 'followers': 120, 'engagement': 4.5},
            {'date': 'Tue', 'followers': 150, 'engagement': 4.8},
            {'date': 'Wed', 'followers': 180, 'engagement': 5.2},
            {'date': 'Thu', 'followers': 220, 'engagement': 5.5},
            {'date': 'Fri', 'followers': 240, 'engagement': 5.9},
            {'date': 'Sat', 'followers': 300, 'engagement': 6.5},
            {'date': 'Sun', 'followers': 350, 'engagement': 7.0}
        ],
        'demographics': [
            {'name': '18-24', 'value': 35},
            {'name': '25-34', 'value': 45},
            {'name': '35-44', 'value': 15},
            {'name': '45+', 'value': 5}
        ]
    }
    return jsonify(trend_data)

@app.route('/api/trends/predict', methods=['GET'])
def api_trends_predict():
    predictions = {
        'upcoming_trends': [
            'Micro-vlogging for niche hobbies',
            'Augmented reality try-on reviews',
            'Long-form raw interviews'
        ],
        'best_time_to_post': 'Tuesday at 6:00 PM EST',
        'content_ideas': [
            'Create a behind-the-scenes look at your workflow.',
            'Share a 3-part tutorial on your most asked question.',
            'Collaborate with a micro-influencer in an adjacent niche.'
        ]
    }
    return jsonify(predictions)

@app.route('/api/trends/bookmarks', methods=['GET', 'POST', 'DELETE'])
def api_trends_bookmarks():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        if request.method == 'GET':
            user_id = request.args.get('user_id')
            if not user_id:
                return jsonify({'error': 'Missing user_id'}), 400
            cursor.execute("SELECT * FROM trend_bookmarks WHERE user_id = %s ORDER BY saved_at DESC", (user_id,))
            bookmarks = cursor.fetchall()
            return jsonify(bookmarks)
            
        elif request.method == 'POST':
            data = request.json
            user_id = data.get('user_id')
            keyword = data.get('keyword')
            platform = data.get('platform', 'all')
            if not user_id or not keyword:
                return jsonify({'error': 'Missing user_id or keyword'}), 400
                
            cursor.execute(
                "INSERT INTO trend_bookmarks (user_id, keyword, platform) VALUES (%s, %s, %s) ON CONFLICT (user_id, keyword) DO NOTHING",
                (user_id, keyword, platform)
            )
            conn.commit()
            return jsonify({'message': 'Trend bookmarked successfully'}), 201
            
        elif request.method == 'DELETE':
            bookmark_id = request.args.get('id')
            if not bookmark_id:
                return jsonify({'error': 'Missing bookmark id'}), 400
            cursor.execute("DELETE FROM trend_bookmarks WHERE id = %s", (bookmark_id,))
            conn.commit()
            return jsonify({'message': 'Bookmark removed'})
    except Exception as e:
        print(f"Error in bookmarks: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Reviews API Routes ---
@app.route('/api/reviews', methods=['POST'])
def api_reviews():
    data = request.json
    influencer_id = data.get('influencer_id')
    brand_id = data.get('brand_id')
    campaign_id = data.get('campaign_id')
    rating = data.get('rating')
    feedback = data.get('feedback')
    
    if not all([influencer_id, brand_id, rating]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute(
            """INSERT INTO influencer_reviews (influencer_id, brand_id, campaign_id, rating, feedback)
               VALUES (%s, %s, %s, %s, %s)""",
            (influencer_id, brand_id, campaign_id, rating, feedback)
        )
        conn.commit()
        return jsonify({'message': 'Review submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/influencers/<int:influencer_id>/reviews', methods=['GET'])
def api_get_influencer_reviews(influencer_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT r.*, b.company_name, u.profile_pic_url as brand_logo
            FROM influencer_reviews r
            JOIN brands b ON r.brand_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE r.influencer_id = %s
            ORDER BY r.created_at DESC
        """, (influencer_id,))
        reviews = cursor.fetchall()
        return jsonify(reviews), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
# --- Phase B: Chat API Routes ---
@app.route('/api/messages', methods=['POST'])
def api_send_message():
    data = request.json
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    campaign_id = data.get('campaign_id')
    content = data.get('content')
    
    if not all([sender_id, receiver_id, content]):
        return jsonify({'error': 'Missing fields'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute(
            """INSERT INTO messages (sender_id, receiver_id, campaign_id, content) 
               VALUES (%s, %s, %s, %s)""",
            (sender_id, receiver_id, campaign_id, content)
        )
        conn.commit()
        return jsonify({'message': 'Message sent'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/messages/history', methods=['GET'])
def api_get_message_history():
    user_id = request.args.get('user_id')
    contact_id = request.args.get('contact_id')
    
    if not all([user_id, contact_id]):
        return jsonify({'error': 'Missing parameters'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT m.*, u.username as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = %s AND m.receiver_id = %s)
               OR (m.sender_id = %s AND m.receiver_id = %s)
            ORDER BY m.created_at ASC
        """, (user_id, contact_id, contact_id, user_id))
        messages = cursor.fetchall()
        return jsonify(messages), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/inbox', methods=['GET'])
def api_get_inbox():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Get unique contacts
        cursor.execute("""
            SELECT DISTINCT u.id, u.username, u.profile_pic_url, u.role
            FROM users u
            JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
            WHERE (m.sender_id = %s OR m.receiver_id = %s) AND u.id != %s
        """, (user_id, user_id, user_id))
        contacts = cursor.fetchall()
        return jsonify(contacts), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Phase B: Content Drafts API Routes ---
@app.route('/api/drafts', methods=['POST'])
def api_submit_draft():
    data = request.json
    campaign_id = data.get('campaign_id')
    user_id = data.get('user_id')
    draft_url = data.get('draft_url')
    draft_text = data.get('draft_text')
    
    if not all([campaign_id, user_id]):
        return jsonify({'error': 'Missing fields'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id FROM influencers WHERE user_id = %s", (user_id,))
        influencer = cursor.fetchone()
        influencer_id = influencer['id'] if influencer else None
        
        cursor.execute(
            """INSERT INTO content_drafts (campaign_id, influencer_id, draft_url, draft_text) 
               VALUES (%s, %s, %s, %s)""",
            (campaign_id, influencer_id, draft_url, draft_text)
        )
        conn.commit()
        return jsonify({'message': 'Draft submitted'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/campaigns/<int:campaign_id>/drafts', methods=['GET'])
def api_get_drafts(campaign_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT d.*, u.username, u.profile_pic_url
            FROM content_drafts d
            JOIN influencers i ON d.influencer_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE d.campaign_id = %s
            ORDER BY d.created_at DESC
        """, (campaign_id,))
        drafts = cursor.fetchall()
        return jsonify(drafts), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/drafts/<int:draft_id>/status', methods=['PUT'])
def api_update_draft_status(draft_id):
    data = request.json
    status = data.get('status')
    feedback = data.get('feedback')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("UPDATE content_drafts SET status = %s, feedback = %s WHERE id = %s", (status, feedback, draft_id))
        conn.commit()
        return jsonify({'message': 'Draft status updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Phase B: Brand Reviews API Routes ---
@app.route('/api/brand_reviews', methods=['POST'])
def api_brand_reviews():
    data = request.json
    user_id = data.get('user_id')
    brand_id = data.get('brand_id')
    campaign_id = data.get('campaign_id')
    rating = data.get('rating')
    feedback = data.get('feedback')
    
    if not all([user_id, brand_id, rating]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT id FROM influencers WHERE user_id = %s", (user_id,))
        influencer = cursor.fetchone()
        influencer_id = influencer['id'] if influencer else None
        
        cursor.execute(
            """INSERT INTO brand_reviews (influencer_id, brand_id, campaign_id, rating, feedback)
               VALUES (%s, %s, %s, %s, %s)""",
            (influencer_id, brand_id, campaign_id, rating, feedback)
        )
        conn.commit()
        return jsonify({'message': 'Review submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/brands/<int:brand_id>/reviews', methods=['GET'])
def api_get_brand_reviews(brand_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT r.*, u.username as influencer_username, u.profile_pic_url as influencer_logo
            FROM brand_reviews r
            JOIN influencers i ON r.influencer_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE r.brand_id = %s
            ORDER BY r.created_at DESC
        """, (brand_id,))
        reviews = cursor.fetchall()
        return jsonify(reviews), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================================
# PHASE C: FINANCIALS & NOTIFICATIONS
# ==========================================

@app.route('/api/notifications', methods=['GET'])
def api_get_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        notifications = cursor.fetchall()
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications/<int:notif_id>/read', methods=['PUT'])
def api_read_notification(notif_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (notif_id,))
        conn.commit()
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/invoices', methods=['POST'])
def api_create_invoice():
    data = request.json
    campaign_id = data.get('campaign_id')
    brand_id = data.get('brand_id')
    influencer_id = data.get('influencer_id')
    amount = data.get('amount')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute(
            "INSERT INTO payments_invoices (campaign_id, brand_id, influencer_id, amount, status) VALUES (%s, %s, %s, %s, 'pending')",
            (campaign_id, brand_id, influencer_id, amount)
        )
        conn.commit()
        return jsonify({'message': 'Invoice created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/invoices', methods=['GET'])
def api_get_invoices():
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    
    if not user_id or not role:
        return jsonify({'error': 'Missing user_id or role'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        if role == 'brand':
            cursor.execute("""
                SELECT p.*, c.title as campaign_title, u.username as influencer_name
                FROM payments_invoices p
                JOIN campaigns c ON p.campaign_id = c.id
                JOIN users u ON p.influencer_id = u.id
                WHERE p.brand_id = %s
                ORDER BY p.created_at DESC
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT p.*, c.title as campaign_title, u.username as brand_name
                FROM payments_invoices p
                JOIN campaigns c ON p.campaign_id = c.id
                JOIN users u ON p.brand_id = u.id
                WHERE p.influencer_id = %s
                ORDER BY p.created_at DESC
            """, (user_id,))
        
        invoices = cursor.fetchall()
        return jsonify(invoices), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/invoices/<int:invoice_id>/pay', methods=['PUT'])
def api_pay_invoice(invoice_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE payments_invoices SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = %s", (invoice_id,))
        
        # Create a notification for the influencer
        cursor.execute("SELECT influencer_id, amount FROM payments_invoices WHERE id = %s", (invoice_id,))
        invoice = cursor.fetchone()
        if invoice:
            cursor.execute("INSERT INTO notifications (user_id, title, message) VALUES (%s, %s, %s)",
                           (invoice[0], 'Payment Received', f"You have received ${invoice[1]} payment from a brand."))
        conn.commit()
        return jsonify({'message': 'Invoice paid successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================================
# PHASE D: ANALYTICS & AI MOCKS
# ==========================================

@app.route('/api/analytics', methods=['GET'])
def api_get_analytics():
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    
    if not user_id or not role:
        return jsonify({'error': 'Missing user_id or role'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        metrics = {}
        if role == 'brand':
            cursor.execute("SELECT COUNT(*) as total_campaigns, SUM(budget) as total_budget FROM campaigns WHERE brand_user_id = %s", (user_id,))
            camp_stats = cursor.fetchone()
            cursor.execute("SELECT COUNT(DISTINCT influencer_id) as total_influencers_hired FROM payments_invoices WHERE brand_id = %s", (user_id,))
            inf_stats = cursor.fetchone()
            cursor.execute("SELECT SUM(amount) as total_spent FROM payments_invoices WHERE brand_id = %s AND status = 'paid'", (user_id,))
            spent_stats = cursor.fetchone()
            
            metrics = {
                'total_campaigns': camp_stats['total_campaigns'] or 0,
                'total_budget': camp_stats['total_budget'] or 0,
                'influencers_hired': inf_stats['total_influencers_hired'] or 0,
                'total_spent': spent_stats['total_spent'] or 0
            }
        else:
            cursor.execute("SELECT id FROM influencers WHERE user_id = %s", (user_id,))
            inf = cursor.fetchone()
            if inf:
                inf_id = inf['id']
                cursor.execute("SELECT COUNT(*) as active_campaigns FROM ad_requests WHERE influencer_id = %s AND status = 'accepted'", (inf_id,))
                camp_stats = cursor.fetchone()
                cursor.execute("SELECT SUM(amount) as total_earnings FROM payments_invoices WHERE influencer_id = %s AND status = 'paid'", (user_id,))
                earn_stats = cursor.fetchone()
                cursor.execute("SELECT AVG(rating) as average_rating FROM brand_reviews WHERE influencer_id = %s", (inf_id,))
                rate_stats = cursor.fetchone()
                
                metrics = {
                    'active_campaigns': camp_stats['active_campaigns'] or 0,
                    'total_earnings': earn_stats['total_earnings'] or 0,
                    'average_rating': rate_stats['average_rating'] or 0
                }
                
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/ai/caption-generator', methods=['POST'])
def api_ai_caption_generator():
    data = request.json
    niche = data.get('niche', 'Lifestyle')
    product = data.get('product', 'Awesome Product')
    tone = data.get('tone', 'casual')
    
    import random
    templates = [
        f"Just got my hands on {product}! Absolutely loving it for my {niche} needs. 🔥 If you're looking for something {tone}, this is it. Link in bio!",
        f"Game changer alert! 🚨 {product} has completely transformed my daily routine. A must-have for anyone interested in {niche}. Thoughts?",
        f"Trying out {product} today... and wow. The quality is unmatched! 🚀 #ad #{niche} #musthave"
    ]
    
    selected_caption = random.choice(templates)
    return jsonify({
        'caption': selected_caption,
        'hashtags': f"#{niche.replace(' ', '')} #{product.replace(' ', '')} #sponsor"
    }), 200

# Keep existing HTML routes for fallback/compatibility
@app.route('/register', methods=['GET', 'POST'])
def register():
    # Redirect legacy HTML requests to the modern React frontend
    return redirect('http://localhost:5173/register')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Redirect legacy HTML requests to the modern React frontend
    return redirect('http://localhost:5173/login')
    
# ... (Other routes can remain or be removed if fully switching) ...

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
