var app = (function () {
    'use strict';
    // global error handling
    var showAlert = function(message, title, callback) {
        navigator.notification.alert(message, callback || function () {
        }, title, 'OK');
    };
    var showError = function(message) {
        showAlert(message, 'Error occured');
    };
    window.addEventListener('error', function (e) {
        e.preventDefault();
        var message = e.message + "' from " + e.filename + ":" + e.lineno;
        showAlert(message, 'Error occured');
        return true;
    });

    var onBackKeyDown = function(e) {
        e.preventDefault();
        navigator.notification.confirm('Do you really want to exit?', function (confirmed) {
            var exit = function () {
                navigator.app.exitApp();
            };
            if (confirmed === true || confirmed === 1) {
                AppHelper.logout().then(exit, exit);
            }
        }, 'Exit', 'Ok,Cancel');
    };
    var onDeviceReady = function() {
        //Handle document events
        document.addEventListener("backbutton", onBackKeyDown, false);

    };

    document.addEventListener("deviceready", onDeviceReady, false);
    
    function id(element) {
    return document.getElementById(element);
}

    var applicationSettings = {
        emptyGuid: '00000000-0000-0000-0000-000000000000',
        apiKey: 'loMiF9mVeuYhjbVr'
    };

    // initialize Everlive SDK
    var el = new Everlive({
        apiKey: applicationSettings.apiKey
    });
    //var imageToUpload;
    var mimeMap = {
        jpg  : "image/jpeg",
        jpeg : "image/jpeg"
    };
    
    function captureApp() {
}

captureApp.prototype = {
    pictureSource:null,
    
    destinationType:null,
    
    run:function() {
        var that = this;
        id("captureImage").addEventListener("click", function() {
            that._captureImage.apply(that, arguments);
        });
    },
    
    _captureImage:function() {
        var that = this;
        navigator.device.capture.captureImage(function() {
            that._captureSuccess.apply(that, arguments);
        }, function() { 
            captureApp._captureError.apply(that, arguments);
        }, {limit:1});
    },
    
    _captureSuccess:function(capturedFiles) {
        //imageToUpload = capturedFiles[0];
        //var i,
        //media = document.getElementById("media");
        //media.innerHTML = "";
/*        for (i=0;i < capturedFiles.length;i+=1) {
            media.innerHTML+='<p>Capture taken! Its path is: ' + capturedFiles[i].name + '</p>'
            media.innerHTML+='<img src="' + capturedFiles[i].fullPath + '"alt="styles/images/avatar.png" width="50%" />'
        }*/
    },
    
    _captureError:function(error) {
        if (device.uuid == "e0101010d38bde8e6740011221af335301010333" || device.uuid == "e0908060g38bde8e6740011221af335301010333") {
            alert(error);
        }
        else {
/*            var media = document.getElementById("media");
            media.innerHTML = "An error occured! Code:" + error.code;*/
        }
    },
}

    var facebook = new IdentityProvider({
        name: "Facebook",
        loginMethodName: "loginWithFacebook",
        endpoint: "https://www.facebook.com/dialog/oauth",
        response_type:"token",
        client_id: "622842524411586",
        redirect_uri:"https://www.facebook.com/connect/login_success.html",
        access_type:"online",
        scope:"email",
        display: "touch"
    });
    
    var AppHelper = {
        resolveProfilePictureUrl: function (id) {
            if (id && id !== applicationSettings.emptyGuid) {
                return el.Files.getDownloadUrl(id);
            }
            else {
                return 'styles/images/avatar.png';
            }
        },
        resolvePictureUrl: function (id) {
            if (id && id !== applicationSettings.emptyGuid) {
                return el.Files.getDownloadUrl(id);
            }
            else {
                return '';
            }
        },
        getBase64ImageFromInput : function (input, cb) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                if (cb)
                    cb(e.target.result);
            };
            reader.readAsDataURL(input);
        },
        getImageFileObject: function(input, cb) {
            var name = input.name;
            var ext = name.substr(name.lastIndexOf('.') + 1);
            var mimeType = mimeMap[ext];
            if(mimeType) {
                this.getBase64ImageFromInput(input, function(base64) {
                    var res = {
                        "Filename"    : name,
                        "ContentType" : mimeType,              
                        "base64"      : base64.substr(base64.lastIndexOf('base64,')+7)
                    }
                    cb(null, res);
                });
            } else {
                cb("File type not supported: " + ext);    
            }
        },
        formatDate: function (dateString) {
            var date = new Date(dateString);
            var year = date.getFullYear().toString();
            var month = date.getMonth().toString();
            var day = date.getDate().toString();
            return day + '.' + month + '.' + year;
        },
        logout: function () {
            return el.Users.logout();
        }
    };

    var mobileApp = new kendo.mobile.Application(document.body, { transition: 'slide', layout: 'mobile-tabstrip' });

    var usersModel = (function () {
        var currentUser = kendo.observable({ data: null });
        var usersData;
        var loadUsers = function () {
            return el.Users.currentUser()
            .then(function (data) {
                var currentUserData = data.result;
                currentUserData.PictureUrl = AppHelper.resolveProfilePictureUrl(currentUserData.Picture);
                currentUser.set('data', currentUserData);
                return el.Users.get();
            })
            .then(function (data) {
                usersData = new kendo.data.ObservableArray(data.result);
            })
            .then(null,
                  function (err) {
                      showError(err.message);
                  }
            );
        };
        return {
            load: loadUsers,
            users: function () {
                return usersData;
            },
            currentUser: currentUser
        };
    }());

    // login view model
    var loginViewModel = (function () {
        var login = function () {
            var username = $('#loginUsername').val();
            var password = $('#loginPassword').val();

            el.Users.login(username, password)
            .then(function () {
                return usersModel.load();
            })
            .then(function () {
                mobileApp.navigate('views/activitiesView.html');
            })
            .then(null,
                  function (err) {
                      showError(err.message);
                  }
            );
        };
        var loginWithFacebook = function() {
            mobileApp.showLoading();
            facebook.getAccessToken(function(token) {
                el.Users.loginWithFacebook(token)
                .then(function () {
                    return usersModel.load();
                })
                .then(function () {
                    mobileApp.hideLoading();
                    mobileApp.navigate('views/activitiesView.html');
                })
                .then(null, function (err) {
                    mobileApp.hideLoading();
                    if (err.code = 214) {
                        showError("The specified identity provider is not enabled in the backend portal.");
                    }
                    else {
                        showError(err.message);
                    }
                });
            })
        } 
        return {
            login: login,
            loginWithFacebook: loginWithFacebook
        };
    }());

    // signup view model
    var singupViewModel = (function () {
        var dataSource;
        var signup = function () {
            dataSource.Gender = parseInt(dataSource.Gender);
            var birthDate = new Date(dataSource.BirthDate);
            if (birthDate.toJSON() === null)
                birthDate = new Date();
            dataSource.BirthDate = birthDate;
            Everlive.$.Users.register(
                dataSource.Username,
                dataSource.Password,
                dataSource)
            .then(function () {
                showAlert("Registration successful");
                mobileApp.navigate('#welcome');
            },
                  function (err) {
                      showError(err.message);
                  }
            );
        };
        var show = function () {
            dataSource = kendo.observable({
                Username: '',
                Password: '',
                DisplayName: '',
                Email: '',
                Gender: '1',
                About: '',
                Friends: [],
                BirthDate: new Date()
            });
            kendo.bind($('#signup-form'), dataSource, kendo.mobile.ui);
        };
        return {
            show: show,
            signup: signup
        };
    }());

    var activitiesModel = (function () {
        var activityModel = {
            id: 'Id',
            fields: {
                Text: {
                    field: 'Text',
                    defaultValue: ''
                },
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                Picture: {
                    fields: 'Picture',
                    defaultValue: ''
                },
                UserId: {
                    field: 'UserId',
                    defaultValue: ''
                },
                Likes: {
                    field: 'Likes',
                    defaultValue: []
                }
            },
            CreatedAtFormatted: function () {
                return AppHelper.formatDate(this.get('CreatedAt'));
            },
            PictureUrl: function () {
                return AppHelper.resolvePictureUrl(this.get('Picture'));
            },
            User: function () {
                var userId = this.get('UserId');
                var user = $.grep(usersModel.users(), function (e) {
                    return e.Id === userId;
                })[0];
                return user ? {
                    DisplayName: user.DisplayName,
                    PictureUrl: AppHelper.resolveProfilePictureUrl(user.Picture)
                } : {
                    DisplayName: 'Anonymous',
                    PictureUrl: AppHelper.resolveProfilePictureUrl()
                };
            }
        };
        var activitiesDataSource = new kendo.data.DataSource({
            type: 'everlive',
            
            schema: {
                model: activityModel
            },
            transport: {
                // required by Everlive
                typeName: 'Activities'
            },
            change: function (e) {
                if (e.items && e.items.length > 0) {
                    $('#no-activities-span').hide();
                }
                else {
                    $('#no-activities-span').show();
                }
            },
            sort: { field: 'CreatedAt', dir: 'desc' }
        });
        return {
            activities: activitiesDataSource
        };
    }());

    // activities view model
    var activitiesViewModel = (function () {
                captureApp = new captureApp();
        captureApp.run();
        var activitySelected = function (e) {
            mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
        };
        var navigateHome = function () {
            mobileApp.navigate('#welcome');
        };
        var logout = function () {
            AppHelper.logout()
            .then(navigateHome, function (err) {
                showError(err.message);
                navigateHome();
            });
        };
        return {
            activities: activitiesModel.activities,
            activitySelected: activitySelected,
            logout: logout
        };
    }());

    // activity details view model
    var activityViewModel = (function () {
        return {
            show: function (e) {
                var activity = activitiesModel.activities.getByUid(e.view.params.uid);
                kendo.bind(e.view.element, activity, kendo.mobile.ui);
            }
        };
    }());
    
        // **************************************************
    //           new view model for add picture
    // **************************************************
    var $newStatus;
    //var validator;
  
    var observable = {
        picName: '',
        picTitle: '',
        picSelected: false,
        onPicSet: function(e) {
            this.set('picSelected', true);
            this.set('picName', e.target.files[0].name);
        },
        onRemovePic: function() {
            this.set("picSelected", false);
            // reset the file upload selector
            $newStatus = $newStatus || $("#newPicture");
            $newStatus.replaceWith($newStatus = $newStatus.clone(true));
        },
        onAddPic: function() {
            $newStatus = $newStatus || $("#newPicture");
            $newStatus.click();
        },
        saveItem: function() {
            var that = this;
            $newStatus = $newStatus || $("#newPicture");
            AppHelper.getImageFileObject(
                $newPicture[0].files[0],
                function( err, fileObj ) {
                    if(err) {
                        navigator.notification.alert(err);    
                        return;
                    }
                    $.ajax({
                        type: "POST",
                        url: 'https://api.everlive.com/v1/loMiF9mVeuYhjbVr/Files',
                        contentType: "application/json",
                        data: JSON.stringify(fileObj),
                        error: function(error){
                            navigator.notification.alert(JSON.stringify(error));
                        }
                    }).done(function(data){
                        var activities = activitiesModel.activities;
                        var activity = activities.add();
                        activity.Text = $newStatus.val();
                        activity.Picture = data.Result.Id;
                        activity.UserId = usersModel.currentUser.get('data').Id;
                        activities.one('sync', function () {
                            mobileApp.navigate('#:back');
                        });
                        activities.sync();
                        
                        // reset the form
                        that.set("picSelected", false);
                        $newStatus.replaceWith($newStatus = $newStatus.clone(true));
                    });
                }
            );          
        }
    };
    // ***************** END ****************************/

    // add activity view model
    var addActivityViewModel = (function () {

        var $newStatus;
        var validator;
        var init = function () {
            validator = $('#enterStatus').kendoValidator().data("kendoValidator");
            $newStatus = $('#newStatus');
        };
        var show = function () {
            $newStatus.val('');
            validator.hideMessages();
        };
        var saveActivity = function () {
            if (validator.validate()) {
                var activities = activitiesModel.activities;
                var activity = activities.add();
                activity.Text = $newStatus.val();
                activity.UserId = usersModel.currentUser.get('data').Id;
                activities.one('sync', function () {
                    mobileApp.navigate('#:back');
                });
                activities.sync();
            }
        };
        return {
            init: init,
            show: show,
            me: usersModel.currentUser,
            saveActivity: saveActivity
        };
    }());
        
    var beersModel = (function () {
        var beerModel = {
            id: 'Id',
            fields: {
                Name: {
                    field: 'Name',
                    defaultValue: ''
                },
                DrinkCount: {
                    field: 'DrinkCount',
                    defaultValue: '0'
                },
                Abv: {
                    field: 'Abv',
                    defaultValue: '0'
                },
                Type: {
                    field: 'Type',
                    defaultValue: ''
                },
                Label: {
                    fields: 'Label',
                    defaultValue: ''
                }
            },
/*            CreatedAtFormatted: function () {
                return AppHelper.formatDate(this.get('CreatedAt'));
            },*/
            LabelUrl: function () {
                return AppHelper.resolvePictureUrl(this.get('Label'));
            },
/*            User: function () {
                var userId = this.get('UserId');
                var user = $.grep(usersModel.users(), function (e) {
                    return e.Id === userId;
                })[0];
                return user ? {
                    DisplayName: user.DisplayName,
                    PictureUrl: AppHelper.resolveProfilePictureUrl(user.Picture)
                } : {
                    DisplayName: 'Anonymous',
                    PictureUrl: AppHelper.resolveProfilePictureUrl()
                };
            }*/
        };
        var beersDataSource = new kendo.data.DataSource({
            type: 'everlive',
            schema: {
                model: beerModel
            },
            transport: {
                // required by Everlive
                typeName: 'Beers'
            },
            change: function (e) {
                if (e.items && e.items.length > 0) {
                    $('#no-activities-span').hide();
                }
                else {
                    $('#no-activities-span').show();
                }
            },
            sort: { field: 'Name', dir: 'asc'},
            group: { field: 'Type'}
        });
        return {
            beers: beersDataSource
        };
    }());
    
    var beersViewModel = (function () {
                var beerSelected = function (e) {
            mobileApp.navigate('views/beerView.html?uid=' + e.data.uid);
        };
        return {
            beers: beersModel.beers,
            beerSelected: beerSelected,
        };
    }());
    
    var beerViewModel = (function () {
        return {
            show: function (e) {
                var beer = beersModel.beers.getByUid(e.view.params.uid);
                kendo.bind(e.view.element, beer, kendo.mobile.ui);
            }
        };
    }());
    

    return {
        viewModels: {
            login: loginViewModel,
            signup: singupViewModel,
            activities: activitiesViewModel,
            beers: beersViewModel,
            activity: activityViewModel,
            beer: beerViewModel,
            addActivity: addActivityViewModel
        }
    };
}());