"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

import os, jwt, base64
from datetime import datetime
from app import app, db, login_manager
from flask import render_template, request, flash, url_for, redirect, jsonify, _request_ctx_stack, g
from flask_login import login_user, logout_user, current_user, login_required
from app.models import Posts, Users, Likes, Follows
from .forms import RegisterForm, LoginForm, NewPostForm
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from functools import wraps


########
# from flask_marshmallow import Marshmallow


# class PostSchema(ma.Schema):
#     class Meta:
#         fields = ('user_id', 'photo', 'caption', 'created_on')
# post_schema = PostSchema()
# posts_schema = PostSchema(many=True)

###############




#Create a JWT @requires_auth decorator
# This decorator can be used to denote that a specific route should check
# for a valid JWT token before displaying the contents of that route.
def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.headers.get('Authorization', None)
    if not auth:
      return jsonify({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'}), 401

    parts = auth.split()

    if parts[0].lower() != 'bearer':
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}), 401
    elif len(parts) == 1:
      return jsonify({'code': 'invalid_header', 'description': 'Token not found'}), 401
    elif len(parts) > 2:
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}), 401

    token = parts[1]
    try:
         payload = jwt.decode(token, app.config['TOKEN_SECRET'])

    except jwt.ExpiredSignature:
        return jsonify({'code': 'token_expired', 'description': 'token is expired'}), 401
    except jwt.DecodeError:
        return jsonify({'code': 'token_invalid_signature', 'description': 'Token signature is invalid'}), 401

    g.current_user = user = payload
    return f(*args, **kwargs)

  return decorated


@app.route('/api/users/register', methods=["POST"])
# Accepts user information and saves it to the database.
def register():
    print ("enterd")
    
    registerform = RegisterForm()
    
    if request.method == "POST":
        
        if registerform.validate_on_submit():
            
            username = registerform.username.data
            password = registerform.password.data
            firstname = registerform.firstname.data
            lastname = registerform.lastname.data
            email = registerform.email.data
            location = registerform.location.data
            biography = registerform.biography.data
            profile_photo = registerform.profile_photo.data
            photofilename = secure_filename(profile_photo.filename)
            profile_photo.save(os.path.join(app.config['UPLOAD_FOLDER'], photofilename))
            joined_on = datetime.utcnow()
            
            registration = {"message": "User successfully registered"}
        
            user = Users(username, password, firstname, lastname,email, location, biography, photofilename, joined_on)
            db.session.add(user)
            db.session.commit()
            return jsonify(registration=registration)
            
        else:
            #return jsonify(errors=form_errors(registerform))
            return jsonify(errors=[{"errors": form_errors(registerform) }])

    return jsonify(errors=[{"errors": form_errors(registerform) }])
    #return render_template('index.html', registerform=registerform)


@app.route('/api/auth/login', methods=["POST"])
# Accepts login credentials as username and password
def login():
    loginform = LoginForm()
    
    if request.method == "POST":
        
        if loginform.validate_on_submit():
            
            username = loginform.username.data
            password = loginform.password.data
            
            user = Users.query.filter_by(username=username).first()

            if user is not None and check_password_hash(user.password, password):
                # get user id, load into session
                login_user(user)
                
                payload = {
                    username: username
                }
                token = jwt.encode(payload, app.config['TOKEN_SECRET'], algorithm='HS256').decode('utf-8')
                id=user.id
                successlogin = {
                        "token": token,
                        "message": "User successfully logged in.",
                        "id":id   
                    }
                
                return jsonify(error=None, successlogin=successlogin)
            else:
                flash('Username or Password is incorrect.')
                #return jsonify(errors=form_errors(loginform))
                return jsonify(postvalidation={"postvalidation":"Username or Password is incorrect."})

    return jsonify(errors=[{"errors": form_errors(loginform) }])
    

@app.route('/api/auth/logout', methods=["GET"])
#@login_required
# Logout a user
@requires_auth
def logout():
    logout_user()
    logout = {
            "message": "User successfully logged out."        
        }
    return jsonify(logout=logout)
    

@app.route('/api/users/<user_id>', methods=["GET"])
@login_required
def getUserDetails(user_id):
    
    post_list= Posts.query.filter_by(user_id=user_id).all()
    posts=[{"id":post.id, "user_id":post.user_id,"photo":post.photo,"description":post.caption,"created_on":post.created_on}for post in post_list]

    user=Users.query.filter_by(id=user_id).first()
    user_details=[{"id":user.id,"username":user.username,"firstname":user.firstname,"lastname":user.lastname,"email":user.email,"location":user.location,"biography":user.biography,"profile_photo":user.profile_photo,"joined_on":user.joined_on,"posts":posts}]

    return jsonify(getUserDetails=user_details)


            

@app.route('/api/users/<user_id>/posts', methods=["GET"])
##@requires_auth
@login_required
# Returns a user's posts
def viewposts(user_id):
    userid=user_id
    post_list= Posts.query.filter_by(user_id=userid).all()
    posts=[{"id":post.id, "user_id":post.user_id,"photo":post.photo,"description":post.caption,"created_on":post.created_on}for post in post_list]
    return jsonify(viewposts=posts)

@app.route('/api/users/<user_id>/follow', methods=["POST","GET"])
##@requires_auth
#Create a Follow relationship between the current user and the target user.
def follow(user_id):
    print("heyyy")
    if request.method == "POST":
        print("hhhhhhhhheyyyyy")
        content=request.get_json()
        print(content)
##        content = request.body["follower_id"]
##        
##        followmessage = [
##        {
##            "message": "You are now following that user."
##        }]
##        
##        follows = Follows(user_id, content["follower_id"])
##        
##        db.session.add(follows)
##        db.session.commit()
        
        return jsonify(follow=[{"followers":"jjjjjjjjjjjj"}])
    else:
        currentfollows = Follows.query.filter_by(user_id=user_id).first()
        if type(currentfollows)!=list:
            num_followers = [{"followers":0 }]
        else:
            num_followers = [{"followers": len(currentfollows)}]
        return jsonify(follow=num_followers)


# @app.route('/api/users/{user_id}/posts', methods=["GET"])
# #@login_required
# @requires_auth
# # Returns a user's posts
# def viewposts():
     
#      postlist = get_uploaded_images()
     
#      return jsonify(postlist=postlist)

# @app.route('/api/users/{user_id}/follow', methods=["POST"])
# @requires_auth
# #Create a Follow relationship between the current user and the target user.
def follow(user_id):
    
    
    if request.method == "POST":
        
        content = request.get_json()
        
        followmessage = [
        {
            "message": "You are now following that user."
        }]
        
        follows = Follows(user_id, content['follower_id'])
        
        db.session.add(follows)
        db.session.commit()
        
        return jsonify(followmessage=followmessage)

    currentfollows = Follows.query.filter_by(user_id=user_id).first()

    num_followers = [
        {
            "followers": currentfollows
        }]
    return jsonify(num_followers=num_followers)
    
@app.route('/api/posts', methods=["GET"])
@requires_auth
# Return all posts for all userss
def allposts():
    
    allpost = Posts.query.all()
    
    return jsonify({"post": allpost})
    

@app.route('/api/posts/{post_id}/like', methods=["POST"])
@requires_auth
# Set a like on the current Post by the logged in User
def like(post_id):
    
    likescontent = request.get_json()
    
    likes = Likes(likescontent["user_id"], post_id)
    
    db.session.add(likes)
    db.session.commit()
    
    currentlikes = (Likes.query.filter_by(post_id=post_id).first()).user_id.count()
    
    likesmessage = [
        {
            "message": "Post liked!",
            "likes": currentlikes
        }]
        
    return jsonify(likesmessage=likesmessage)
        

###
# Routing for your application.
###

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    """
    Because we use HTML5 history mode in vue-router we need to configure our
    web server to redirect all routes to index.html. Hence the additional route
    "/<path:path".
    Also we will render the initial webpage and then let VueJS take control.
    """
    return render_template('index.html')


def get_uploaded_images():
    imageslist = []
    rootdir = os.getcwd()
    print (rootdir)
    for subdir, dirs, files in os.walk(rootdir + '/app/static/uploads'):
        for file in files:
            print (os.path.join(subdir, file))
            imageslist.append(file)

    return imageslist

# Here we define a function to collect form errors from Flask-WTF
# which we can later use
def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u"Error in the %s field - %s" % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)

    return error_messages


###
# The functions below should be applicable to all Flask apps.
###

# user_loader callback. This callback is used to reload the user object from
# the user ID stored in the session
@login_manager.user_loader
def load_user(id):
    return Users.query.get(int(id))

###
# The functions below should be applicable to all Flask apps.
###

@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)

@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also tell the browser not to cache the rendered page. If we wanted
    to we could change max-age to 600 seconds which would be 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404
    
def format_date_joined(date_joined):
    ## Format the date to return day, month and year date
    return "Joined on " + date_joined.strftime("%A %B %d, %Y") 


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
