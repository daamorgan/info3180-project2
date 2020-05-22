from . import db
from werkzeug.security import generate_password_hash
import datetime

class Posts(db.Model):   
    __tablename__ = 'user_post'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    photo = db.Column(db.String(80),unique=True)
    caption = db.Column(db.String(255))
    created_on= db.Column(db.DateTime(), default=datetime.datetime.utcnow)

    def __init__(self,user_id,photo,caption,created_on):
        self.user_id=user_id
        self.photo=photo
        self.caption=caption
        self.created_on=created_on

    def __repr__(self):
        return '<Photo %r>' % (self.photo)



class Users(db.Model):
    id=db.Column(db.Integer, primary_key=True, autoincrement=True)
    username=db.Column(db.String(80), unique=True)
    password=db.Column(db.String(255))
    firstname=db.Column(db.String(80))
    lastname=db.Column(db.String(80))
    email=db.Column(db.String(120), unique=True)
    location=db.Column(db.String(120))
    biography=db.Column(db.String(255))
    profile_photo=db.Column(db.String(255))
    joined_on= db.Column(db.DateTime(), default=datetime.datetime.utcnow)

    def __init__(self,username,password,firstname,lastname,email,location,biography,profile_photo,joined_on):
        self.firstname=firstname
        self.lastname=lastname
        self.username=username
        self.password=generate_password_hash(password,method='pbkdf2:sha256')
        self.email=email
        self.location=location
        self.biography=biography
        self.profile_photo=profile_photo
        self.joined_on=joined_on
            
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.username)


class Likes(db.Model):
    id=db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id=db.Column(db.Integer)
    post_id= db.Column(db.Integer)


    def __init__(self,user_id,post_id):
        self.user_id=user_id
        self.post_id=post_id
        
    def __repr__(self):
        return '<Likes ID %r>' % (self.id)

        
 

class Follows(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    follower_id = db.Column(db.Integer)  

    def __init__(self,user_id,follower_id):
        self.user_id=user_id
        self.follower_id=follower_id
  
    def __repr__(self):
        return '<Follower ID %r>' % (self.id)

