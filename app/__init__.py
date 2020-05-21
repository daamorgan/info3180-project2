from flask import Flask		
from flask_login import LoginManager		
from flask_sqlalchemy import SQLAlchemy		
from flask_jwt import JWT		

from flask_wtf.csrf import CSRFProtect 		


UPLOAD_FOLDER = './app/static/uploads'		
TOKEN_SECRET = "Y\xe9]T\x87\xe2\x1f_\xbd\x1f\x13\xa9\x82\xf2\xa2U\xb3\xb9\xbb\x8ac@e<\xfb\x8d\x11c4R\x9dW\xb6\xa7\xc9\xaf\xcf4^\x03'3A\xbe\x1e6\x00\xf4\x17\xcf\x9d\xe6\x8a\xe0\xb9\xd1\x15\xfaw\xcck\xd1t\x80"		

app = Flask(__name__)		
csrf = CSRFProtect(app)		

app.config['SECRET_KEY'] = "b'\xa1\xb4\x1d'I\x88\xf5l\x13\x8a!\xedlU\x1d\xc1\x01\xe0\x12\xf1\xb2\xb5c\xf1\xea\xecg\x18\xf9\xc6\x11I'"		
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://project2:project2Team@localhost/project2"		
#app.config['SQLALCHEMY_DATABASE_URI'] = 		
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True  # added just to suppress a warning		
db = SQLAlchemy(app)		

# Flask-Login login manager		
login_manager = LoginManager()		
login_manager.init_app(app)		
login_manager.login_view = 'login'		

app.config.from_object(__name__)		
from app import views 
