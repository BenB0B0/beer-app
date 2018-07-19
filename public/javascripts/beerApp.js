//beerApp.js
var app = angular.module('beerApp', ['ngRoute', 'ngResource', 'ngCookies'])
.run(function($http, $rootScope, $cookies, $location) {
  $rootScope.authenticated = false;
  $rootScope.current_user = '';
  $rootScope.Beer_List = 'Beer List';
  $rootScope.slogan = 'test';
  $rootScope.rating_box_color = "";
  $rootScope.rating_box_text_color = "";
  $rootScope.beer_start_index = 0;
  $rootScope.beer_pagination_amount = 5;
  $rootScope.show_more_info = false;

  //Beer Stats variables 
  $rootScope.amountRated = 0;
  $rootScope.averageRating = 0;
  $rootScope.beer_stats_color = '#72ff6d'; //Green,yellow,or red
  $rootScope.beer_stats_word='';
  //User Stats variables
  $rootScope.topRatedType = [];
  $rootScope.favoriteBeers = [];

  $rootScope.signout = function(){
    $http.get('auth/signout');
    $rootScope.authenticated = false;
    $rootScope.current_user = '';
    $cookies.remove('user');
  };

  /* Keep Session Alive */
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    if ($cookies.get('user') !== undefined){
      var user = JSON.parse($cookies.get('user')); 
      $rootScope.authenticated = true
      $rootScope.current_user = user.username;
      $rootScope.isAdmin = user.admin;
    }
  })

  // Slogans
  $rootScope.ranSlogan = function(){
    var num = Math.floor((Math.random() * 3) + 1);
    if(num===1){ $rootScope.slogan = '"Homer no function beer well without" -Homer'; }
    if(num===2){ $rootScope.slogan = '"This site is the Rotten Tomatoes for Beer!" -George Washington'; }
    if(num===3){ $rootScope.slogan = '"You miss 100% of the shots you don\'t take -Wayne Gretzky" -Michael Scott'; }    
  };
});

app.config(function($routeProvider){
  $routeProvider
    //the timeline display
    .when('/', {
      templateUrl: 'main.html',
      controller: 'mainController'
    })
    //the login display
    .when('/login', {
      templateUrl: 'login.html',
      controller: 'authController'
    })
    //the signup display
    .when('/register', { //register????????  --> signup
      templateUrl: 'register.html',
      controller: 'authController'
    })
    .when('/admin', {
      templateUrl: 'admin.html',
      controller: 'adminController'
    });
});

app.factory('postService', function($resource){
  return $resource('/api/posts/:id');
});

app.factory('userService', function($resource){
  return $resource('/api/users/:id');
});

/* ----- MAIN PAGE CONTROLLER ------- */
app.controller('mainController', function($rootScope, $scope, postService){
  
  $scope.posts = postService.query();
  $scope.newBeer = {created_by: '', beerNameText: '', beerTypeText: '', beerRatingText: '', beerCommentsText: '', created_at: ''};

  //create a new post 
  $scope.post = function() {
    $scope.newBeer.created_by = $rootScope.current_user;
    $scope.newBeer.created_at = Date.now();
    if($scope.newBeer.beerTypeText===''){
      $scope.newBeer.beerTypeText = 'Unknown';
    }
    if($scope.newBeer.beerCommentsText===''){
      $scope.newBeer.beerCommentsText = 'No Comments';
    }
    postService.save($scope.newBeer, function(){
      $scope.posts = postService.query();
      $scope.newBeer = {created_by: '', beerNameText: '', beerTypeText: '', beerRatingText: '', beerCommentsText: '', created_at: ''};
    });
  };
 
  //delete a post
  $scope.delete = function(post) {
      postService.delete({id: post._id});
      $scope.posts = postService.query();
  };

  //filter by userPosts
  $scope.userPosts = function(user) {
     $scope.searchText = user;
     $rootScope.Beer_List = user + "'s Posts:";
     $scope.hideSearchBox = true;
  };

  //filter on beer name
  $scope.beerFilter = function(beer) {
    $rootScope.Beer_List = '';
    $scope.hideSearchBox = true;
  }

  //set beer list back to default 
  $scope.beerList = function() {
    $rootScope.Beer_List = "Beer List";
    $rootScope.show_more_info = false;
  };
  
  $scope.clickedPrevious = function() {
    console.log()
    if($rootScope.beer_start_index !== 0){
      $rootScope.beer_start_index = $rootScope.beer_start_index - $rootScope.beer_pagination_amount;
    }
  };

  $scope.clickedNext= function(posts) {
    if($rootScope.beer_start_index + $rootScope.beer_pagination_amount < posts) {
      $rootScope.beer_start_index = $rootScope.beer_start_index + $rootScope.beer_pagination_amount;
    }
    
  };
  
  //logic for which smiley emoji to display
  $scope.whichSmiley = function(rating) {
    $rootScope.rating_box_color = "lightgray";
    if(rating<1 || rating>10){
      return;
    }
    if(rating>=3){
      if(rating>=9){
        $rootScope.rating_box_color = "lightgreen";
        $rootScope.rating_box_text_color = "black";
        return 9;
      }
      if(rating>=7){
        $rootScope.rating_box_color = "lightgreen";
        $rootScope.rating_box_text_color = "black";
        return 7;
      }
      if(rating>=5){
        $rootScope.rating_box_color = "yellow";
        $rootScope.rating_box_text_color = "black";
        return 5;
      }
      $rootScope.rating_box_color = "#FF3333";
      $rootScope.rating_box_text_color = "white";
      return 3;
    }
    $rootScope.rating_box_color = "#FF3333";
    $rootScope.rating_box_text_color = "white";
    return 1;
  };
  
  $scope.beerStatsClicked = function(){
    if($rootScope.show_more_info){
      $rootScope.show_more_info = false;
    } else {
      $rootScope.show_more_info = true;
    }
  }

  //beer stats logic -- avg rating, amnt of ratings 
  $scope.beerStats = function(beerName) {
    var beerCounter=0;
    var ratingSum=0;
    $scope.posts.forEach(function(post) {
      if(post.beerNameText === beerName){
        beerCounter++;
        ratingSum=ratingSum + Number(post.beerRatingText);
        console.log(ratingSum)
      }

    });
    $rootScope.averageRating = Math.round(ratingSum / beerCounter);
    $rootScope.amountRated = beerCounter;
    if($rootScope.averageRating>5){
      $rootScope.beer_stats_color="#b1ffad";
      $rootScope.beer_stats_word="RECOMMENDED"
    }
    if($rootScope.averageRating===5){
      $rootScope.beer_stats_color="#ffe789"
      $rootScope.beer_stats_word="MEDIOCRE"
    }
    if($rootScope.averageRating<5){
      $rootScope.beer_stats_color="#e06b73"
      $rootScope.beer_stats_word="POORLY RATED"
    }
  };

  $scope.showClearBtn = function(searchText) {
    if(searchText !== '' && searchText != null && $rootScope.Beer_List == 'Beer List'){
      $rootScope.beer_start_index = 0;
      return true;
    }
    return false;
  };  

  $scope.showBackToBeerList = function(searchText){
    if(searchText !== '' && searchText != null && $rootScope.Beer_List != 'Beer List'){
      $rootScope.beer_start_index = 0;
      return true;
    }
    $rootScope.show_more_info = false;
    return false;
  };

  $scope.hideBeerForms = function(searchText){
    if(searchText !== '' && searchText != null || !$rootScope.authenticated){
      return true;
    }
    return false;
  };

  $scope.userStats = function(user){
    $rootScope.topRatedType=[];
    $rootScope.favoriteBeers=[];
    var topRatedTypeNum=0;
    $scope.posts.forEach(function(post) {
      if(post.created_by === user){
        if(Number(post.beerRatingText)>topRatedTypeNum){
          topRatedTypeNum = post.beerRatingText;
        } 
      }
    });
    $scope.posts.forEach(function(post) {
      if(post.created_by === user && post.beerTypeText != 'Unknown'){
        if(Number(post.beerRatingText)>=topRatedTypeNum){
          $rootScope.topRatedType.push(post.beerTypeText);
          $rootScope.favoriteBeers.push(post.beerNameText);
        } 
      }
    });

  };

});

/* ----- AUTHENTICATE CONTROLLER ------- */
app.controller('authController', function($scope, $rootScope, $http, $location, $cookies){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $cookies.put('user', JSON.stringify(data.user));
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });

  };

 $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){

      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});

/* ----- ADMIN CONTROLLER ------- */
app.controller('adminController', function($rootScope, $scope, $http, userService){
  $scope.users = userService.query();

  $scope.admin = function(){
    $http.post('/auth/admin', $scope.user).success(function(data){

      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.delete = function(user) {
      userService.delete({id: user._id});
      $scope.users = userService.query();
  };

});