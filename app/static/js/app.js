// import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
const EventBus = new Vue();






Vue.component('app-header', {
    data:function(){
        return{
            isLogged: this.checkIfIsLogged(),
            path:''
        };
    },
    created () {
        let self = this;
        EventBus.$on('logged', () => {
        self.isLogged = self.checkIfIsLogged();
        });
    },
    methods:{
        removeLogoutOption () {
            let self = this;
            self.isLogged = false;
            self.$router.push('/');
        },
        checkIfIsLogged () {
            let loginstatus = sessionStorage.getItem('authenticateduser');
            if (loginstatus) {
                return true;
            } else {
                return false;
            }
        },
        createLink:function(){
            let self=this;
            
            let user_id=sessionStorage.getItem('user_id');
           
            self.path='/users/'+user_id;
        }
    },
    template: `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <a class="navbar-brand" href="#"> <i class='fas fa-camera-retro'> </i> Photogram</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto">
            <li class="nav-item active">
                <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
            </li>
            <li class="nav-item active">
                <router-link class="nav-link" to="/explore"> Explore</router-link>
            </li>
            <li class="nav-item active">
                <router-link class="nav-link" to="path"> <span @click="createLink"> My Profile</span> </router-link>
            </li>  
            <li class="nav-item active" v-if="isLogged === false">
                <router-link  class="nav-link" to="/login"> Login</router-link>
            </li>
            <li class="nav-item active" v-if="isLogged === true">
                <router-link  to="/logout" class="nav-link">Logout</router-link>
            </li>
            </ul>
        </div>
        </nav>
        `,
        
    });

const Home=Vue.component('home', {
    template:`
        <div id="home" class="text-center">
            <img src="/static/images/pier.jpg" alt="Image" id="homeImg">
            <div class="whitecomponent">
                <h1> <i class='fas fa-camera-retro'></i> Photogram </h1>
                <hr>
                <p class="lead text-left"> Share photos of your favourite moments with friends, family and the world.</p>
                <div class="row d-flex justify-content-around homebtn">
                    <router-link to="/register" tag="button" class="btn btn-success col-md-5">Register </router-link>
                    <router-link to="/login" tag="button" class="btn btn-info col-md-5"> Login </router-link>
                </div>
            </div>
        </div>
    `
});


const register= Vue.component( 'register-page', {
    data:function(){
        return {
            status: "",
            successMessage: "",
            errorMessages:[] /*,
            postValidationError: ''*/
        };
    },

    template:`
        <div id="registerPage" class="col col-lg-5 ">
            <div id="feedback"> 
                <p v-if="status === 'success'" class="alert alert-success"> {{successMessage}}</p>
                <div v-else-if="status === 'invalid form' " class="alert alert-danger">
                    <div v-for="error_array in errorMessages">
                        <div v-for="error_list in error_array">
                            <div v-for="error in error_list">
                                <p> {{error}}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <!--<p v-if="status === 'incorrect user information' " class="alert alert-danger">{{ postValidationError}} </p> -->
            </div>
            <h1> Register</h1>
            <form class="d-flex flex-column whitecomponent card card-body" id="registerForm" @submit.prevent="registerUser" method="post">
                    <label for="username" > Username </label>
                    <input type="text" name="username">
                    <label for="password" > Password </label>
                    <input type="password" name="password">
                    <label for="firstname" >Firstname</label>
                    <input type="text" name="firstname">
                    <label for="lastname" >Lastname</label>
                    <input type="text" name="lastname">
                    <label for="email" > Email</label>
                    <input type="email" name="email">
                    <label for="location" >Location</label>
                    <input type="text" name="location">
                    <label for="biography" > Biography</label>
                    <input type="textarea" name="biography">
                    <label for="profile_photo"> Photo </label>
                    <div><label for="profilephoto" class="custom-file-upload btn btn-basic overbutton">
                        Browse
                    </label><span class="text-muted" id="hideThis">No file selected</span></div>
                    <input id="profilephoto" name='profile_photo' type="file" style="display:none;">
                    <button type="submit" class="btn btn-success" > Register</button>
                    
            </form>
        </div>
    `,

    methods:{
        registerUser: function(){
            let self=this;
            let registerForm=document.getElementById('registerForm');
            let form_data= new FormData(registerForm);
            fetch("/api/users/register", {
                method:"POST",
                body:form_data,
                headers: {
                    'X-CSRFToken': token
                    },
                credentials: 'same-origin'
            })
            .then(response => { return response.json();})
            .then (function (jsonResponse){
                console.log(jsonResponse);
                if (jsonResponse.hasOwnProperty('registration')){
                    self.status="success";
                    self.successMessage=jsonResponse['registration']['message'] + ". You will be redirected shortly to the login page";
                    setTimeout(function(){ 
                        router.push({ path:'/login'}); 
                     }, 3000);
                }else if (jsonResponse.hasOwnProperty('errors')){
                    self.status="invalid form";
                    self.errorMessages=jsonResponse.errors;
                    console.log(self.errorMessages);        
                }
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }
}); 

const login=Vue.component( 'login-page', {
    data: function(){
        return {
            status:'',
            successMessage:'',
            errorMessages:[],
            postValidationError: ''
        };
    },
    
    template:`
        <div id="loginPage" class="col col-lg-5">
            <div id="feedback"> 
                <p v-if="status === 'success'" class="alert alert-success"> {{successMessage}} </p>
                <div v-if="status === 'invalid form' " class="alert alert-danger">
                    <div v-for="error_array in errorMessages">
                        <div v-for="error_list in error_array">
                            <div v-for="error in error_list">
                                <p> {{error}}</p>
                            </div>
                        </div>
                    </div>
                </div> 
                <p v-else-if="status === 'incorrect user information' " class="alert alert-danger"> {{postValidationError}}</p>
            </div>
            <h1> Login</h1>
            <form id="loginForm" @submit.prevent="loginUser" method="post" class="d-flex flex-column whitecomponent card card-body"> 
                <label for="username"> Username</label>
                <input type="text" name="username"/>
                <label for="password"> Password</label>
                <input type="password" name="password"/>
                <button type="submit" class="btn btn-success"> Login </button>
            </form>
        </div>
    `,
       
    methods:{
        loginUser: function(){
            let self=this;
            let loginForm=document.getElementById("loginForm");
            let form_data=new FormData(loginForm);
            fetch('/api/auth/login', {
                method: "POST",
                body: form_data,
                headers: {
                    'X-CSRFToken': token
                    },
                credentials: 'same-origin'
            })
            .then(response => { return response.json();})
            .then(function(jsonResponse){ 
                console.log(jsonResponse);
                if (jsonResponse.hasOwnProperty('successlogin')){ 
                    let jwt_token = jsonResponse['successlogin']['token'];/*do i need to save token*/
                    sessionStorage.setItem('token', jwt_token);/*****    Check *****/
                    sessionStorage.setItem('authenticateduser','loggedIn'); 
                    // sessionStorage.setItem('status','loggedIn');

                    sessionStorage.setItem('user_id', jsonResponse['successlogin']['id']);
                    self.status="success";
                    self.successMessage=jsonResponse['successlogin']['message'] + " You will be redirected shortly. Enjoy!! ";/* ask about this*/
                    EventBus.$emit('logged', 'User logged');
                    setTimeout(function(){
                       router.push({ path:'/explore'}); 
                    }, 3000);
                    
                }else if( jsonResponse.hasOwnProperty('errors')){
                    self.status="invalid form";
                    self.errorMessages=jsonResponse.errors;
                    console.log(jsonResponse.errors);
                }else{
                    self.status="incorrect user information";
                    self.postValidationError=jsonResponse['postvalidation']['postvalidation']; 
                }
            })
            .catch(function (error){
                console.log(error);

            });

            }
        }
});

const newPost=Vue.component('newpost-page', {
    data: function(){
        return{
            success:false,
            failure:false,
            errorMessages: [],
            successMessage:'' 
        }   
    },
    template:`
        <div>
            <div id="feedback"> 
                <p v-if="success" class="alert alert-success"> {{successMessage}}</p>
                <div v-else-if="failure" class="alert alert-danger">
                    <div v-for="error in errorMessages">
                        <p> {{error}}</p>
                    </div>
                </div>
        </div>
            <div id="newpostPage" class="col col-lg-5">
                <h1> New Post</h1>
                <form @submit.prevent="addNewPost" method="post" id="newpostform" class="whitecomponent d-flex flex-column card card-body">
                    <label for="post_photo">Photo</label>
                    <div><label for="postphoto" class="custom-file-upload btn btn-basic overbutton">
                        Browse
                    </label><span class="text-muted" id="hideButton">No file selected</span></div>
                    <input id="postphoto" name='post_photo' type="file" style="display:none;">
                    <label for="caption">Caption</label>
                    <textarea name="caption" placeholder="Write a caption..." rows="3"></textarea>
                    <button type="submit" class="btn btn-success">Submit</button>
                </form>
            </div>
        </div>
    `,
    methods:{
        addNewPost:function(){
            let self=this;
            let newpostform=document.getElementById("newpostform");
            let form_data=new FormData(newpostform);
            let id=Number(sessionStorage.user_id);
            fetch('/api/users/'+id+'/posts', {
                method:"POST",
                body:form_data,
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token'),/*** Check */
                    'X-CSRFToken': token
                    },
                credentials: 'same-origin'
            })
            .then(response => {return response.json();})
            .then(function(jsonResponse){
                console.log(jsonResponse);
                if (jsonResponse.hasOwnProperty('newpostmessage')){
                    self.success=true;
                    self.successMessage=jsonResponse['newpostmessage']['message'] + " You will be redirected shortly to explore page.";/* ask about this*/
                    setTimeout(function(){ 
                        router.push({ path:'/explore'}); 
                     }, 3000);
                }else if(jsonResponse.hasOwnProperty('errors')){
                    self.failure=true;
                    self.errorMessages=jsonResponse['errors']['errors'];
                    console.log(self.errorMessages);
                }

            })
            .catch(function(error){
                console.log(error);
            })

        }
    },
    created:function(){
        // Ensure that user cannot access this page without being authenticated.
        if(!sessionStorage.getItem('authenticateduser')){
            this.$router.push('/');
            alert('Please login to access this page.')////////////////// Need to change this
        }
    }
});


const logout=Vue.component('logout-page',{
     data:function(){
        return{
            successMessage:''
        }
    }, 
    created:function(){
        // Ensure that user cannot access this page without being authenticated.
        if(!sessionStorage.getItem('authenticateduser')){
            this.$router.push('/');
            alert('Please login to access this page.')////////////////// Need to change this
        }

        let self=this;
        fetch('/api/auth/logout', {
            method:"GET",
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token'),/*** Check */
                },
            credentials: 'same-origin'
        }).then( function(response){
            return response.json();
        }).then(function(jsonResponse){
            console.log(jsonResponse);
            if (jsonResponse.hasOwnProperty('logout')){
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user_id');
                sessionStorage.removeItem('authenticateduser');
                EventBus.$emit('logged', 'User logged');
                self.successMessage=jsonResponse['logout']['message'];
                console.log(self.successMessage);
                setTimeout(function(){ 
                        router.push({ path:'/'}); 
                }, 4000);
            }
        }).catch(function (error){
            console.log(error);
        });
    },
    template:`
        <div class="alert alert-success lead">
            <p> {{successMessage}}</p>
            <p> Thank you for visiting. Please come back soon.</p>
        </div>
    `
});



const explore=Vue.component("explore-page", {
    template:`
    <div> 
        <h1> EXPLORE </h1>
        <div>
        <!--NEED FOR LOOP 
            <img :scr="'static/images/'+ FILENAME" > -->
            <p> CAPTION</p>
            <div>
                <p>LIKES</p>
                <p> DATE </p>
            </div>
        </div>
        <router-link type="button" to="/post/new" >NewPost </router-link>
        <button class="btn btn-primary" @click="time"> New Post </button>
    </div> `,
    methods:{
        time:function(){
        setTimeout(function(){ 
            router.push({ path:'/users/2'}); 
        }, 1000);    
        }
    }
    // `,
    // created:function(){
    //     // Ensure that user cannot access this page without being authenticated.
    //     if(!sessionStorage.getItem('authenticateduser')){
    //         this.$router.push('/');
    //         alert('Please login to access this page.')////////////////// Need to change this
    //     }
    // }
});



const NotFound = Vue.component('not-found', {
    template: `
    <div class="text-center">
        <h1 class=" display-1 font-weight-bold">404</h1>
        <p class="lead">That page doesn't even exist.</p>
    </div>
    `,
    data: function () {
        return {};
    }
});

const UserProfile= Vue.component("user-profile", {
    data (){
        return{
            biography:'',

            firstname:'',
            
            lastname:'',
            
            location:'',
            
            joined_on:'',
            
            profile_photo:'',
            
            image_link:'',
            
            num_posts:'',
            
            num_followers:1,
            
            posts: [],
            
            id:this.$route.params.user_id,
            
            followtext:'',
            followingtext:'',
            color:'#0080b3',
            count:0
         }
    },
    created:function(){ 
        
          
        this.userProfile(this.id); 
        this.numFollowers(this.id); 

          
    },
    methods:{
        userProfile:function(user_id){
            
            let self=this;
            self.userid=sessionStorage.getItem('user_id');
            sessionStorage.setItem('followbtn',"Follow");
            self.text=sessionStorage.getItem('followbtn');
                        
            fetch('/api/users/'+user_id, {
            
            method: 'GET',
            headers: {
                'Authorization': 'Bearer'+sessionStorage.getItem('token')
            }
           
            }).then(function (response) {
            
            return response.json();
            
            }).then(function (jsonResponse) {
            
            console.log(jsonResponse);

            self.biography=jsonResponse.getUserDetails[0].biography; 

            self.firstname=jsonResponse.getUserDetails[0].firstname;
            
            self.lastname=jsonResponse.getUserDetails[0].lastname;
            
            self.location=jsonResponse.getUserDetails[0].location;
            
            self.joined_on=jsonResponse.getUserDetails[0].joined_on;
            
            let date=self.joined_on.split(" ",4);
            self.joined_on=date[2]+" "+date[3];

            self.profile_photo=jsonResponse.getUserDetails[0].profile_photo;       
            
            self.image_link='/static/uploads/'+self.profile_photo;

            
            self.posts=jsonResponse.getUserDetails[0].posts;
            
            self.num_posts=self.posts.length;
                       
            
            }).catch(function (error) {
            
            console.log(error);
            
            });
        },
        numFollowers:function(user_id){
            
            let self=this;
            
            
            fetch('/api/users/'+user_id+'/follow',{
                method:'GET',
                headers: {
                'Authorization': 'Bearer'+sessionStorage.getItem('token')
            }
            }).then(function(response){
                return response.json();
            }).then(function(jsonResponse){
                console.log(jsonResponse);
                self.num_followers=jsonResponse.follow[0].followers;
            }).catch(function(error){
                console.log(error);
            });

        },
        postResponse:function(){
            let self=this;
            let user_id=self.userid;
            var variable={
                "follower_id":self.id // Quotes added to follower_id
            };
            fetch('/api/users/'+user_id+'/follow',{
                method:"POST",
                body:JSON.stringify(variable),
                credentials:'same-origin',
                //cache:"no-cache",
                headers: {
                    "content-type": "application/json"
                    }
            }).then(response => {
                console.log(response);
                return response.json();})
            .then (function(jsonResponse){
                console.log("hello")
                console.log(jsonResponse);
            })
            .catch(function(error){
                
                console.log(error);
            });
        }, 
        
        changeText:function () {
            let self=this;

            document.getElementById("btn").style.backgroundColor = "#32CD32";            
            self.color="#32CD32";
                     
            //document.getElementById("btn").innerHTML = "Following";
            sessionStorage.setItem("follow","Following");
            self.text=sessionStorage.getItem('follow');
            self.count=1;
            this.postResponse();
        }

    },
    computed:{
             increaseFollower: function(){
                 let self=this;
                 return 
                    self.num_followers+self.count
                
             }
            
        
        },

     template:`
     <div class="user-profile">
        <div id="user-info">
            <div class="page-bars">
                <div class="leftbar">
                    <img :src="image_link" alt="Profile Photo" id="profile_photo" >
                </div>
                <div class="centerbar">
                    <h4>{{firstname}} {{lastname}} </h4>
                    <p class="no-space"> {{location}} <br>Member since {{joined_on}} </p>
                    <p>{{biography}}</p>
                </div>  
                <div class="rightbar">
                    <div class="num">{{num_posts}}</div>
                    <div class="num" id="followers">{{increaseFollower}}</div>
                    <div> Posts </div> 
                    <div> Followers</div>
                    <div  class="button">
                        <button v-if="color!='#32CD32'" id="btn" @click="changeText()">{{text}}</button>
                      
                        <button v-else class="btn-primary">Follow</button>
                    </div>
                </div>      
            </div> 
        </div>   
        <div class="posts">
            <ul class="images">
                <li v-for="post in posts">
                    <img :src="'/static/uploads/'+post.photo" :alt="post.photo" id="post" >
                </li>
            </ul> 
        </div>     
             
    </div>             
     `
   
 

});


   

const router= new VueRouter({
    mode: 'history', /*Prevents page from reloading*/
    routes:[
        {path: "/" , component: Home },
        {path: "/login", component:login},
        {path: "/register", component: register },
        {path:"/explore", component: explore },
        {path: "/logout", component: logout },
        {path: "/post/new", component: newPost},
        {path:"/users/:user_id", component:UserProfile},/**ADDED !!!!!!!!!!! */
        {path: "*", component: NotFound}
    ]
    
});

let app= new Vue({
    el: "#app",  /* Need to add div with id app in index.html */
    router
});

$('#profilephoto').change(function() {
    var i = $(this).prev('label').clone();
    var file = $('#profilephoto')[0].files[0].name;
    var x = document.getElementById("hideThis");
    x.innerHTML = file;
  });
  
$('#postphoto').change(function() {
    var i = $(this).prev('label').clone();
    var file = $('#postphoto')[0].files[0].name;
    var x = document.getElementById("hideButton");
    x.innerHTML = file;
  });