angular.module('app.controllers', [])
.controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false;  // For hiding the side bar and nav icon

    // When the user logs out and reaches login page,
    // we clear all the history and cache to prevent back link
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });


    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
        $rootScope.extras = true;
        sharedUtils.hideLoading();
        $state.go('menu2', {}, {location: "replace"});

      }
    });


    $scope.loginEmail = function(formName,cred) {


      if(formName.$valid) {  // Check if the form data is valid or not

          sharedUtils.showLoading();

          //Email
          firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {

                // You don't need to save the users session as firebase handles it
                // You only need to :
                // 1. clear the login page history from the history stack so that you cant come back
                // 2. Set rootScope.extra;
                // 3. Turn off the loading
                // 4. Got to menu page
              $rootScope.regEmail = cred.email;
              console.log(cred.email);
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              $state.go('menu2', {}, {location: "replace"});

            },
            function(error) {
              sharedUtils.hideLoading();
              sharedUtils.showAlert("Please note","Authentication Error");
            }
        );

      }else{
        sharedUtils.showAlert("Please note","Entered data is not valid");
      }



    };


    $scope.loginFb = function(){
      //Facebook Login
    };

    $scope.loginGmail = function(){
      //Gmail Login
    };


})

.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,
                                   $state,fireBaseData,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {

      if (formName.$valid) {  // Check if the form data is valid or not

        sharedUtils.showLoading();

        //Main Firebase Authentication part
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

            //Add name and default dp to the Autherisation table
            result.updateProfile({
              displayName: cred.name,
              photoURL: "default_dp"
            }).then(function() {}, function(error) {});

            //Add phone number to the user table
            fireBaseData.refUser().child(result.uid).set({
              telephone: cred.phone
            });

            //Registered OK
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
            $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
            $rootScope.extras = true;
            sharedUtils.hideLoading();
            $state.go('menu2', {}, {location: "replace"});

        }, function (error) {
            sharedUtils.hideLoading();
            sharedUtils.showAlert("Please note","Sign up Error");
        });

      }else{
        sharedUtils.showAlert("Please note","Entered data is not valid");
      }

    }

  })

.controller('menu2Ctrl', function($scope,$rootScope,$ionicSideMenuDelegate,fireBaseData,$state,
                                  $ionicHistory,$firebaseArray,sharedCartService,sharedUtils) {

  //Check if user already logged in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user; //Saves data to user_info
    }else {

      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
      $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $rootScope.extras = false;
      sharedUtils.hideLoading();
      $state.go('tabsController.login', {}, {location: "replace"});

    }
  });

  // On Loggin in to menu page, the sideMenu drag state is set to true
  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;

  // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
  $scope.$on('$ionicView.enter', function(ev) {
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });



  $scope.loadMenu = function() {
    sharedUtils.showLoading();
    $scope.menu=$firebaseArray(fireBaseData.refMenu());
    sharedUtils.hideLoading();
  }

  $scope.showProductInfo=function (id) {

  };
  $scope.addToCart=function(item){
    sharedCartService.add(item);
  };

})

.controller('offersCtrl', function($scope,$rootScope,fireBaseData,sharedUtils) {

    //We initialise it on all the Main Controllers because, $rootScope.extra has default value false
    // So if you happen to refresh the Offer page, you will get $rootScope.extra = false
    //We need $ionicSideMenuDelegate.canDragContent(true) only on the menu, ie after login page
    $rootScope.extras=true;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;
        fireBaseData.refOffers()
          .once('value', function (snapshot) {
            $scope.offers = snapshot.val();
            $scope.$apply();
          });
        sharedUtils.hideLoading();
      }
    });
})

.controller('indexCtrl', function($scope,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate,sharedCartService) {

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user; //Saves data to user_info

        //Only when the user is logged in, the cart qty is shown
        //Else it will show unwanted console error till we get the user object
        $scope.get_total= function() {
          var total_qty=0;
          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            total_qty += sharedCartService.cart_items[i].item_qty;
          }
          return total_qty;
        };

      }else {

        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }
    });

    $scope.logout=function(){

      sharedUtils.showLoading();

      // Main Firebase logout
      firebase.auth().signOut().then(function() {


        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });


        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }, function(error) {
         sharedUtils.showAlert("Error","Logout Failed")
      });

    }

  })
.controller('myCartCtrl', function($scope,$rootScope,$state,sharedCartService) {

    $rootScope.extras=true;
    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $scope.cart=sharedCartService.cart_items;  // Loads users cart

        $scope.get_qty = function() {
          $scope.total_qty=0;
          $rootScope.total_amount=0;
          $rootScope.product_info = "";

          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            $scope.total_qty += sharedCartService.cart_items[i].item_qty;
            $rootScope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
            $rootScope.product_info += sharedCartService.cart_items[i].item_name + "\t";
          }
          
          return $scope.total_qty;
        };
      }
      //We dont need the else part because indexCtrl takes care of it
    });

    $scope.removeFromCart=function(c_id){
      sharedCartService.drop(c_id);
    };

    $scope.inc=function(c_id){
      sharedCartService.increment(c_id);
    };

    $scope.dec=function(c_id){
      sharedCartService.decrement(c_id);
    };

    $scope.checkout=function(){
      $state.go('checkout', {}, {location: "replace"});
    };



})

.controller('lastOrdersCtrl', function($scope,$rootScope,fireBaseData,sharedUtils) {

    $rootScope.extras = true;
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;

        fireBaseData.refTempOrder()
          .orderByChild('user_id')
          .startAt($scope.user_info.uid).endAt($scope.user_info.uid)
          .once('value', function (snapshot) {
            $scope.temp_orders = snapshot.val();
            $scope.$apply();
          });
          sharedUtils.hideLoading();
      }
    });





})

.controller('analyticsCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;
})

.controller('settingsCtrl', function($scope,$rootScope,fireBaseData,$firebaseObject,
                                     $ionicPopup,$state,$window,$firebaseArray,
                                     sharedUtils) {
    //Bugs are most prevailing here
    $rootScope.extras=true;

    //Shows loading bar
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        //Accessing an array of objects using firebaseObject, does not give you the $id , so use firebase array to get $id
        $scope.addresses= $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));

        // firebaseObject is good for accessing single objects for eg:- telephone. Don't use it for array of objects
        $scope.user_extras= $firebaseObject(fireBaseData.refUser().child(user.uid));

        $scope.user_info=user; //Saves data to user_info
        //NOTE: $scope.user_info is not writable ie you can't use it inside ng-model of <input>

        //You have to create a local variable for storing emails
        $scope.data_editable={};
        $scope.data_editable.email=$scope.user_info.email;  // For editing store it in local variable
        $scope.data_editable.password="";

        $scope.$apply();

        sharedUtils.hideLoading();

      }

    });

    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Location";
        var sub_title="Edit your Location";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Add Location";
        var sub_title="Add your new Location";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Block (MRD/B/G/F/Mech/Elec/MBA)" ng-model="data.address" <br/> ' +
                  '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Close' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.address || !$scope.data.phone ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          if(res!=null){ // res ==null  => close

            fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
              address: res.address,
              phone: res.phone
            });

          }
        }else{

          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            address: res.address,
            phone: res.phone
          });

        }

      });

    };

    // A confirm dialog for deleting address
    $scope.deleteAddress = function(del_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Address',
        template: 'Are you sure you want to delete this address',
        buttons: [
          { text: 'No' , type: 'button-stable' },
          { text: 'Yes', type: 'button-assertive' , onTap: function(){return del_id;} }
        ]
      });

      confirmPopup.then(function(res) {
        if(res) {
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(res).remove();
        }
      });
    };

    $scope.save= function (extras,editable) {
      //1. Edit Telephone doesnt show popup 2. Using extras and editable  // Bugs
      if(extras.telephone!="" && extras.telephone!=null ){
        //Update  Telephone
        fireBaseData.refUser().child($scope.user_info.uid).update({    // set
          telephone: extras.telephone
        });
      }

      //Edit Password
      if(editable.password!="" && editable.password!=null  ){
        //Update Password in UserAuthentication Table
        firebase.auth().currentUser.updatePassword(editable.password).then(function(ok) {}, function(error) {});
        sharedUtils.showAlert("Account","Password Updated");
      }

      //Edit Email
      if(editable.email!="" && editable.email!=null  && editable.email!=$scope.user_info.email){

        //Update Email/Username in UserAuthentication Table
        firebase.auth().currentUser.updateEmail(editable.email).then(function(ok) {
          $window.location.reload(true);
          //sharedUtils.showAlert("Account","Email Updated");
        }, function(error) {
          sharedUtils.showAlert("ERROR",error);
        });
      }

    };

    $scope.cancel=function(){
      // Simple Reload
      $window.location.reload(true);
      console.log("CANCEL");
    }

})

.controller('supportCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;

})

.controller('forgotPasswordCtrl', function($scope, $ionicLoading) {
  $scope.user = {
    email: ''
  };
  $scope.errorMessage = null;

  $scope.resetPassword = function() {
    $scope.errorMessage = null;

    $ionicLoading.show({
      template: 'Please wait...'
    });

    firebase.auth().sendPasswordResetEmail($scope.user.email)
        .then(showConfirmation)
        .catch(handleError);
  };

  function showConfirmation() {
    $scope.emailSent = true;
    $ionicLoading.hide();
  }

  function handleError(error) {
    switch (error.code) {
      case 'INVALID_EMAIL':
      case 'INVALID_USER':
        $scope.errorMessage = 'Invalid email';
        break;
      default:
        $scope.errorMessage = 'Invalid email';
    }

    $ionicLoading.hide();
  }
})

.controller('PayUMoneyCtrl', function($scope,$rootScope,$state,sharedUtils) {


  $rootScope.extras=true;
  var form = document.createElement("form");
  form.method = "POST";
  form.action = "https://test.payu.in/_payment";
  var payUMoneyKey = document.createElement("input");
  var payUMoneyTxnId = document.createElement("input");
  var payUMoneyAmount = document.createElement("input");
  var payUMoneyProductInfo = document.createElement("input");
  var payUMoneyFirstName = document.createElement("input");
  var payUMoneyEmail = document.createElement("input");
  var payUMoneyPhone = document.createElement("input");
  var payUMoneySUrl = document.createElement("input");
  var payUMoneyFUrl = document.createElement("input");
  var payUMoneyHash = document.createElement("input");
  var payUMoneyServiceProvider = document.createElement("input");

  payUMoneyKey.name = "key";
  payUMoneyTxnId.name = "txnid";
  payUMoneyAmount.name = "amount";
  payUMoneyProductInfo.name = "productinfo";
  payUMoneyFirstName.name = "firstname";
  payUMoneyEmail.name = "email";
  payUMoneyPhone.name = "phone";
  payUMoneySUrl.name = "surl";
  payUMoneyFUrl.name = "furl";
  payUMoneyHash.name = "hash";
  payUMoneyServiceProvider.name = "service_provider";

  // payUMoneyKey.value = "K88iBbMD";
  payUMoneyKey.value = "iaomiM3O";
  payUMoneyTxnId.value = $rootScope.transactionID;
  console.log(payUMoneyTxnId.value);
  payUMoneyAmount.value = $rootScope.total_amount;
  console.log(payUMoneyAmount.value);
  payUMoneyProductInfo.value = $rootScope.product_info;
  console.log(payUMoneyProductInfo.value);
  payUMoneyFirstName.value = $rootScope.user_name;
  console.log(payUMoneyFirstName.value);
  payUMoneyEmail.value = $rootScope.regEmail;
  console.log(payUMoneyEmail.value);
  payUMoneyPhone.value = $rootScope.payUMoneyNumber;
  payUMoneySUrl.value = $state.go('menu2', {}, {location: "replace", reload: true});
  payUMoneyFUrl.value = $state.go('transactionFailure', {}, {location: "replace", reload: true});

  // hashSequence = payUMoneyKey.value | payUMoneyTxnId.value | payUMoneyAmount.value | payUMoneyProductInfo.value | payUMoneyFirstName.value | payUMoneyEmail.value | "" | "" | "" | "" | "" | "" | "" | "" | "" | "" | "IhB112kPHg";
  hashSequence = payUMoneyKey.value + "|" + payUMoneyTxnId.value + "|" + payUMoneyAmount.value + "|" + payUMoneyProductInfo.value + "|" + payUMoneyFirstName.value + "|" + payUMoneyEmail.value + "|||||||||||" + "BbcwaIDm8J";
  
  console.log(hashSequence);
  
  var shaObj = new jsSHA("SHA-512", "TEXT");
  shaObj.update(hashSequence);
  $hash = shaObj.getHash("HEX");
  // payUMoneyHash.value = $hash;
  payUMoneyTxnId.value = "Zm7jhsrRbrVly99Kbn8XxKUTBTZ2:24/11/2017 @ 12:31:46-Friday";
  payUMoneyHash.value = "3217d1cd2e8f603ed335498dab1c418f3733745d8178887e067bdc1982b0f5fc7913fa52864796c4bec17f0c2668c9ebcd8ece0eafe7db856cb7995b21c75973";
  console.log($hash);

  // var hash = new sha512().create();
  // hash.update(hashSequence);
  // console.log(hash.hex());

  payUMoneyServiceProvider.value = "payu_paisa";

  form.appendChild(payUMoneyKey);
  form.appendChild(payUMoneyTxnId);
  form.appendChild(payUMoneyAmount);
  form.appendChild(payUMoneyProductInfo);
  form.appendChild(payUMoneyFirstName);
  form.appendChild(payUMoneyEmail);
  form.appendChild(payUMoneyPhone);
  form.appendChild(payUMoneySUrl);
  form.appendChild(payUMoneyFUrl);
  form.appendChild(payUMoneyHash);
  form.appendChild(payUMoneyServiceProvider);

  document.body.appendChild(form);
  sharedUtils.showAlert(payUMoneyHash.value);
  form.submit();
  // sendRequest();
  // $scope.sendRequest = function() {
  //     var dataValue = $("#keyName").val();
  //     $.ajax({
  //                 type : 'POST',
  //                 //remove the .php from results.php.php
  //                 url : "https://test.payu.in/_payment",
  //                 //Add the request header
  //                 headers : {
  //                     Authorization : "pbb5+56Z43tfzlbYNQ5bBxjs7gF7o8hB6FGMRn8BAwI="
  //                 },
  //                 contentType : 'application/x-www-form-urlencoded',
  //                 //Add form data
  //                 data : {keyName : dataValue},
  //                 success : function(response) {
  //                     console.log(response);
  //                 },
  //                 error : function(xhr, status, error) {
  //                     var err = eval("(" + xhr.responseText + ")");
  //                     console.log(err);                   
  //                 }
  //             }); //End of Ajax
  //     };  


})

.controller('payUMoneyFailureCtrl', function($scope,$rootScope) {
  $rootScope.extras=true;
})

.controller('checkoutCtrl', function($scope,$rootScope,sharedUtils,$state,$firebaseArray,
                                     $ionicHistory,fireBaseData, $ionicPopup,sharedCartService) {

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.addresses= $firebaseArray( fireBaseData.refUser().child(user.uid).child("address") );
        $scope.user_info=user;
      }
    });

    $scope.payments = [
      {id: 'PayUMoney', name: 'PayUMoney'},
      {id: 'COD', name: 'COD'}
    ];
    realAddress = "";
    realPayment = "";
    block = "";
    bookingPhoneNumber = "";
  function gotData(data){
    var users = data.val();
    var userKeys = Object.keys(users);
    for(var i = 0; i< userKeys.length;i++){
      var userId = userKeys[i];
      if(userId.localeCompare($scope.user_info.uid) == 0) {
        var userAddress = users[userId].address;
        if(userAddress){
          var addressKeys = Object.keys(userAddress);
          for(var j = 0; j < addressKeys.length;j++){
            var addressId = addressKeys[j];
            if(addressId.localeCompare(realAddress) == 0){
              var addressName = userAddress[addressId].address;
              block = addressName;
              console.log(addressName);
              var phoneNumber = userAddress[addressId].phone;
              bookingPhoneNumber = phoneNumber;
              console.log(phoneNumber);
            }
          }
        }
      }
    }
    $rootScope.payUMoneyNumber = bookingPhoneNumber;
    tStamp = new Date();

    days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    datetime = tStamp.getDate() + "/"
      + (tStamp.getMonth()+1)  + "/"
      + tStamp.getFullYear() + " @ "
      + tStamp.getHours() + ":"
      + tStamp.getMinutes() + ":"
      + tStamp.getSeconds() + "-"
      + days[tStamp.getDay()];
      $rootScope.user_name = $scope.user_info.displayName;
    for (i = 0; i < sharedCartService.cart_items.length; i++) {
      //Add cart item to order table
      fireBaseData.refOrder().push({

        //Product data is hardcoded for simplicity
        product_name: sharedCartService.cart_items[i].item_name,
        product_price: sharedCartService.cart_items[i].item_price,
        product_image: sharedCartService.cart_items[i].item_image,
        product_id: sharedCartService.cart_items[i].$id,

        //item data
        item_qty: sharedCartService.cart_items[i].item_qty,

        //Order data
        user_id: $scope.user_info.uid,
        user_name:$scope.user_info.displayName,
        address_id: realAddress,
        payment_id: realPayment,
        status: "Queued",
        order_time:datetime,
        user_address:block + " Block",
        user_phone:bookingPhoneNumber,
        user_orderComp:$scope.user_info.uid + datetime + sharedCartService.cart_items[i].$id
      });

      fireBaseData.refTempOrder().push({

        //Product data is hardcoded for simplicity
        product_name: sharedCartService.cart_items[i].item_name,
        product_price: sharedCartService.cart_items[i].item_price,
        product_image: sharedCartService.cart_items[i].item_image,
        product_id: sharedCartService.cart_items[i].$id,

        //item data
        item_qty: sharedCartService.cart_items[i].item_qty,

        //Order data
        user_id: $scope.user_info.uid,
        user_name:$scope.user_info.displayName,
        address_id: realAddress,
        payment_id: realPayment,
        status: "Queued",
        order_time:datetime,
        user_address:block + " Block",
        user_phone:bookingPhoneNumber,
        user_orderComp:$scope.user_info.uid + datetime + sharedCartService.cart_items[i].$id
      });

    }
    
    $rootScope.transactionID = $scope.user_info.uid + ":" + datetime;

    //Remove users cart
    fireBaseData.refCart().child($scope.user_info.uid).remove();
    // sharedUtils.showAlert(realPayment);
    if (realPayment.localeCompare("PayUMoney") == 0) {
      $state.go('PayUMoney', {}, {location: "replace", reload: true})
    }
    else{
      sharedUtils.showAlert("Info", "Order Successfull");

    //Go to past order page
    $ionicHistory.nextViewOptions({
      historyRoot: true
    });
    $state.go('lastOrders', {}, {location: "replace", reload: true});
    }
    



  }
  function errData(err){

  }
    $scope.pay=function(address,payment){

      if(address==null || payment==null){
        //Check if the checkboxes are selected ?
        sharedUtils.showAlert("Error","Please choose from the Address and Payment Modes.")
      }
      else {
        // Loop throw all the cart item

        realAddress = address;
        realPayment = payment;
        var userRef = database.ref('users');
        userRef.on('value',gotData,errData);



      }
    }


    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Location";
        var sub_title="Edit your Location";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Add Location";
        var sub_title="Add your new Location";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Block (MRD/B/G/F/Mech/Elec/MBA)" ng-model="data.address" <br/><br/> ' +
        '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Close' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.phone || !$scope.data.address) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
            address: res.address,
            phone: res.phone
          });

        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            address: res.address,
            phone: res.phone
          });

        }

      });

    };


  })

