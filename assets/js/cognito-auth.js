/*global GetHealthy _config AmazonCognitoIdentity AWSCognito*/

var DietSelector = window.DietSelector || {};
// var currentUser;


(function scopeWrapper($) {
    var signinUrl = 'signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
        _config.cognito.userPoolClientId &&
        _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    // Manipulate html based on whether user is logged in or not, then run event listener
    if (userPool.getCurrentUser() === null) {
        document.getElementById('headerUser').innerHTML =
            '<a href="signin.html" class="button alt">Login</a><a href="register.html" class="button alt">Sign up</a>';
        document.getElementById('menuUser').innerHTML =
            '<li><a href="signin.html" class="button fit">Login</a></li><li><a href="register.html" class="button fit">Sign up</a></li>';
        // if (document.getElementById('mainUser') != null) {
        //     document.getElementById('mainUser').innerHTML =
        //         '<a href="signin.html" class="button">Login</a><br><br><a href="register.html" class="button">Sign up</a>';
        // }
        if (document.getElementById('profileUsername') != null) {
            document.getElementById('profileUsername').innerHTML =
                '<h1>User Dashboard</h1><a href="signin.html" class="button">Login</a><a href="register.html" class="button">Sign Up</a>';
        }
    } else {
        currentUser = userPool.getCurrentUser().username
        document.getElementById('headerUser').innerHTML =
            '<a href="user.html" class="button alt">My Profile</a><a href="challenge.html" id="menuSignout1" class="button alt">Sign out</a>';
        document.getElementById('menuUser').innerHTML =
            '<li><a href="user.html" class="button fit">My Profile</a></li><li><a href="challenge.html" id="menuSignout2" class="button fit">Sign out</a></li>';
        // if (document.getElementById('mainUser') != null) {
        //     document.getElementById('mainUser').innerHTML =
        //         '<a href="user.html" class="button">My Profile</a>';
        //     document.getElementById('mainUserText').outerHTML = '';
        // }
        if (document.getElementById('profileUsername') != null) {
            document.getElementById('profileUsername').innerHTML =
                '<h1>' + currentUser.replace("-at-", "@") + '</h1>';
        }
    }

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    GetHealthy.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    GetHealthy.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(email, phone, alias, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var dataPhone = {
            Name: 'phone_number',
            Value: '+1' + phone
        };
        var dataAlias = {
            Name: 'nickname',
            Value: alias
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributePhone = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhone);
        var attributeAlias = new AmazonCognitoIdentity.CognitoUserAttribute(dataAlias);

        // If phone # provided grab, else just email and alias
        if (phone.length > 0) {
            var attributes = [attributeEmail, attributePhone, attributeAlias]
        } else {
            var attributes = [attributeEmail, attributeAlias]
        }

        userPool.signUp(toUsername(email), password, attributes, null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );

    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(email),
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#signoutForm').submit(handleSignout);
        $('#menuSignout1').click(handleSignout);
        $('#menuSignout2').click(handleSignout);
    });

    function handleSignout(event) {
        GetHealthy.signOut();
    }

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'challenge.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var phone = $('#phoneInputRegister').val();
        var alias = $('#aliasInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(email, phone, alias, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');

                // Should autofill the email used in the verify page - fix later
                // var w = window.open(signinUrl);
                // w.myVariable = email;
                // console.log(window.opener.myVariable)

                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
