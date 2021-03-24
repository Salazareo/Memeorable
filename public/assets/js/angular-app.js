(function () {
	var app = angular.module("Memeorable", []);
	//Factory so each controller has the correct user
	app.factory("User", function () {
		return {
			username: localStorage.username,
			env: window.location.protocol + "//" + window.location.host
		};
	});
	app.directive("post", function () {
		return {
			restrict: "E",
			templateUrl: "directives/test.html"
		};
	});

	app.directive("ngFileSelect", function () {
		return {
			link: function ($scope, el) {
				el.bind("change", function (e) {
					//$scope.file = (e.srcElement || e.target).files[0];
					let r = new FileReader();
					r.onload = function (e) {
						$scope.imageSrc = e.target.result;
						$scope.$apply();
					}
					r.readAsDataURL(e.target.files[0]);
				})
			}
		}
	});

	app.controller('loginCtrl', function ($scope, User) {
		$scope.User = User;
		$scope.remember = localStorage.remember;
		$scope.newUser = localStorage.new ? true : false;
		$scope.invalidUser = false;
		$scope.invalidPass = false;
		$scope.incorrectUserPass = false;
		$scope.buggy = false;

		isLoggedIn($scope);

		this.keyListen = (e) => {
			if (e.keyCode == 13) {
				this.logIn();
			}
		}

		this.logIn = () => {
			let username = $("#username").val();
			let password = $("#password").val();
			if (!username || !password) {
				if (!username) {
					$scope.invalidUser = true;
				}
				if (!password) {
					$scope.invalidPass = true;
				}
				return;
			}
			username = username.toLowerCase();
			let req = {
				username: username,
				password: CryptoJS.SHA256(password, username).toString()
			};
			let xhttp = customHttp("POST", "/api/login", () => {
				if (xhttp.status != 200) {
					$scope.incorrectUserPass = true;
					$scope.$apply();
					return;
				}
				localStorage.token = xhttp.responseText;
				localStorage.username = username;

				if ($("#remember").prop("checked") == true) {
					localStorage.remember = username;
				} else {
					localStorage.remember = "";
				}
				localStorage.removeItem("new");
				window.location.href = "/index.html";
			});
			xhttp.send(JSON.stringify(req));
		}
		this.resetColor = (isUserField) => {
			if (isUserField) {
				$scope.invalidUser = false;
			} else {
				$scope.invalidPass = false;
			}
			$scope.incorrectUserPass = false;
		}
	});
	app.controller('registerCtrl', function ($scope, User) {
		$scope.User = User;
		$scope.errors = [false, false, false, false, false, false];

		isLoggedIn($scope);

		this.errorsExist = () => {
			for (var i in $scope.errors) {
				if ($scope.errors[i]) {
					return true;
				}
			}
			return false;
		}

		this.keyListen = (e) => {
			if (e.keyCode == 13) {
				this.register();
			}
		}

		this.register = () => {

			let username = $("#username").val();
			let email = $("#email").val();
			let password = $("#password").val();
			let password_confirm = $("#con_password").val();
			let terms_conditions = $("#agree").prop("checked");
			let clean_username = sanitizeString(username);
			let clean_password = sanitizeString(password);
			let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,13}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			let validEmail = emailRegex.test(email);
			$scope.errors = [false, false, false, false, false, false];
			if (username != clean_username || clean_username == "") {
				$scope.errors[0] = true;
			}
			if (!validEmail) {
				$scope.errors[1] = true;
			}
			if (password != clean_password || !password || password.length < 4) {
				$scope.errors[2] = true;
			}
			if (password_confirm != password) {
				$scope.errors[3] = true;
			}
			if (!terms_conditions) {
				$scope.errors[4] = true;
			}
			if (!this.errorsExist()) {
				username = username.toLowerCase();
				var req = {
					username: username,
					email: email,
					password: CryptoJS.SHA256(password, username).toString()
				}
				let xhttp = customHttp("POST", "/api/register", () => {
					if (xhttp.status == 200) {
						localStorage.remember = "";
						localStorage.new = 'true';
						window.location.href = "/login.html";
					} else {
						// {if (xhttp.status == 422) { 
						//WE shoulc check for server oofs
						$scope.errors[5] = true;
						$scope.$apply();
						return;
					}
				});
				xhttp.send(JSON.stringify(req))
			}
		}
		this.resetColor = (errorInt) => {
			$scope.errors[5] = false;
			$scope.errors[errorInt] = false;
		}
	});
	app.controller('themeCtrl', function ($scope, User) {
		$scope.User = User;
		$scope.inDev = true;
		$scope.darkmode = false;
		$scope.loggedOut = true;
		$scope.userPic = null;
		this.copy = (id) => {
			document.getElementById(id).select();
			document.execCommand("copy");
		}
		this.swapDarkmode = (param) => {
			$("#preloader").fadeIn(250);
			setTimeout(() => {
				let xhttp = customHttp("PUT", "/api/user", () => {
					$scope.darkmode = param;
					$scope.$apply();
					$("#preloader").delay(250).fadeOut(750);
				});
				xhttp.send(JSON.stringify({
					darkmode: param
				}));
			}, 250);
		};

		let getUserInfo = () => {
			if (!User.username || !localStorage.token) {
				return;
			} else {
				let xhttp = customHttp("GET", "/api/user", () => {
					if (xhttp.status != 200) {
						this.logOut();
						console.log("Token invalid, expired, or not logged in");
					} else {
						$scope.loggedOut = false;
						let response = JSON.parse(xhttp.responseText);
						$scope.darkmode = response.darkmode;
						$scope.userPic = response.profilePicture;
						$scope.aboutMe = response.aboutMe;
						$scope.joined = getDate(response.dateJoined.toString());
						$scope.email = response.email;
					}
					$scope.$apply();
				});
				xhttp.send();
			}
		};
		getUserInfo();
		this.logOut = () => {
			let temp = localStorage.remember
			localStorage.clear();
			localStorage.remember = temp;
		}
		this.search = () => {

			let tags = strongerSanitize($("#SearchBar").val())
				.split(' ').filter((tag) => {
					return tag != '';
				});
			if (!tags.length) {
				return alert("Type something valid silly!");
			}
			window.location = '/search-results.html?tag=' + tags[0];
		}
		this.keyListen = (e) => {
			if (e.keyCode == 13) {
				this.search();
			}
		}

	});
	app.controller("shareCtrl", function ($scope, User) {
		let q = new URLSearchParams(location.search);
		$scope.id = q.get("id");
		$scope.User = User;
		$scope.post = {
			post: {},
			comments: {
				amount: 0,
				comments: []
			}
		};
		let getPostInfo = () => {
			getPosts($scope, "/api/post/" + $scope.id, 2);
			loadComments($scope, -1, $scope.id);
		}
		getPostInfo();
		this.addProfileComment = () => {
			addComment($scope, -1);
		}
		this.Vote = (type) => {
			vote($scope, type, -1);
		}
		this.loadMoreComments = () => {
			loadMoreComments($scope, -1);
		}

	});
	app.controller('settingsCtrl', function ($scope, User) {
		$scope.User = User;
		$scope.descChangeError = false;
		$scope.invalidDesc = false;
		this.curTab = 1;

		this.swapTab = (tab) => {
			$scope.success = false;
			$scope.invalidDesc = false;
			$scope.badPass = false;
			$scope.notMatch = false;
			$scope.incorrectPass = false;
			this.curTab = tab;
		};
		this.saveChanges = () => {
			$scope.invalidDesc = false;
			$scope.success = false;
			let desc = sanitizeString($('#set_desc').val());
			if (desc != $("#set_desc").val()) {
				$scope.invalidDesc = true;
				return;
			}
			let xhttp = customHttp("PUT", "/api/user", () => {
				if (xhttp.status != 200) {
					$scope.serverError = true;
					$scope.success = false;
				} else {
					$scope.aboutMe = desc;
					$scope.success = true;
					$scope.serverError = false;
					$scope.invalidDesc = false;
				}
				$scope.$apply();
			});
			xhttp.send(JSON.stringify({
				aboutMe: desc
			}));
		}
		$scope.changeErrors = () => {
			return $scope.badPass || $scope.notMatch ||
				$scope.incorrectPass || $scope.serverError ||
				$scope.invalidDesc;
		}

		this.changePassword = () => {
			$scope.badPass = false;
			$scope.notMatch = false;
			$scope.incorrectPass = false;
			$scope.serverError = false;
			let oldPass = $("#pw").val();
			let newPass = $("#new_pw").val();
			let confPass = $("#new_pw_con").val();
			let cleanNewPass = sanitizeString(newPass);
			if (newPass != cleanNewPass || !newPass || newPass.length < 4) {
				$scope.badPass = true;
			}
			if (newPass != confPass) {
				$scope.notMatch = true;
			}
			if ($scope.notMatch || $scope.badPass) {
				return;
			} else {
				let xhttp = customHttp("POST", "/api/resetPassword", () => {
					$("#pw").val('');
					$("#new_pw").val('');
					$("#new_pw_con").val('');
					if (xhttp.status == 401) {
						$scope.incorrectPass = true;
						$scope.success = false;
					} else if (xhttp.status == 200) {
						$scope.success = true;
					} else {
						$scope.serverError = true;
					}
					$scope.$apply();
				});
				xhttp.send(JSON.stringify({
					oldPassword: CryptoJS.SHA256(oldPass, $scope.User.username).toString(),
					newPassword: CryptoJS.SHA256(newPass, $scope.User.username).toString()
				}));
			}
		}

		this.keyListen = (e) => {
			if (e.keyCode == 13) {
				if (this.curTab == 1) {
					this.saveChanges();
				} else if (this.curTab == 2) {
					this.changePassword();
				}
			}
		}
	});
	app.controller('searchCtrl', function ($scope) {
		let q = new URLSearchParams(location.search);
		let tag = q.get("tag");
		$scope.tag = strongerSanitize(tag.toLowerCase());
		$scope.postC = 1;
		$scope.userC = 1;
		$scope.posts = [];
		$scope.users = [];
		$scope.noPosts = false;
		$scope.noUsers = false;
		$scope.moreU = true;
		$scope.more = true;
		$scope.moreC = true;
		$scope.garbage = false;

		let searchPosts = () => {
			if (!$scope.tag) {
				$scope.garbage = true;
				return;
			}
			let endpoint = '/api/searchPosts/' + $scope.tag + '/' + $scope.postC;
			getPosts($scope, endpoint, 8);
		};
		searchPosts();

		this.getMorePosts = () => {
			getMorePosts($scope, '/api/searchPosts/' + $scope.tag + '/' + $scope.postC, 8);
		}

		this.loadComments = (index) => {
			loadComments($scope, index);
		}

		this.loadMoreComments = (index) => {
			loadMoreComments($scope, index);
		}

		this.Vote = (type, index) => {
			vote($scope, type, index);
		}

		this.addProfileComment = (index) => {
			addComment($scope, index);
		}

		let searchUsers = () => {
			if (!$scope.tag) {
				$scope.garbage = true;
				return;
			}
			let endpoint = '/api/searchUsers/' + $scope.tag + '/' + $scope.userC;
			let xhttp = customHttp('GET', endpoint, () => {
				if (xhttp.status != 200) {
					return;
				}
				let response = JSON.parse(xhttp.responseText);
				$scope.userC += 1;
				$scope.users = response;
				if (response.length < 8) {
					$scope.moreU = false;
				}
				$scope.$apply();
			});
			xhttp.send();
		}
		searchUsers();

		this.searchMoreUsers = () => {
			let endpoint = '/api/searchUsers/' + $scope.tag + '/' + $scope.userC;
			let xhttp = customHttp('GET', endpoint, () => {
				if (xhttp.status != 200) {
					return;
				}
				let response = JSON.parse(xhttp.responseText);
				$scope.userC += 1;
				$scope.users += response
				if (response.length < 8) {
					$scope.moreU = false;
				}
				$scope.$apply();
			});
			xhttp.send();
		}
	});
	app.controller("feedCtrl", function ($scope, User) {
		$scope.User = User;
		$scope.more = true;
		$scope.postC = 1;
		$scope.posts = [];
		$scope.voteWait = false;
		$scope.moreC = true;
		let getFeed = () => {
			let req = '/api/feed/' + $scope.postC;
			getPosts($scope, req, 6);
		}
		getFeed();

		this.Vote = (type, index) => {
			vote($scope, type, index);
		}
		this.loadMoreFeed = () => {
			let req = '/api/feed/' + $scope.postC;
			getMorePosts($scope, req, 6);
		}
		this.loadComments = (index) => {
			loadComments($scope, index);
		}
		this.loadMoreComments = (index) => {
			loadMoreComments($scope, index);
		};
		this.addProfileComment = (index) => {
			addComment($scope, index);
		}
	});
	app.controller("discoverCtrl", function ($scope) {
		$scope.templates = [];
		$scope.more = true;
		$scope.count = 1;
		let getDiscoverFeed = () => {
			getNewTemplates($scope, "/api/templates/" + $scope.count)
		};
		getDiscoverFeed();
		$scope.loadMoreDfeed = () => {
			getMoreTemplates($scope, "/api/templates/" + $scope.count);
		}
	});
	app.controller("postByTemplateCtrl", function ($scope, User) {
		$scope.favourite = false;
		$scope.posts = [];
		$scope.more = true;
		$scope.postC = 1;
		$scope.commentC = 1;
		$scope.numPosts = 0;
		var q = new URLSearchParams(location.search);
		let id = q.get('id');

		let getTemplateInfo = () => {
			let xhttp = customHttp("GET", '/api/template/' + id, () => {
				let response = JSON.parse(xhttp.responseText);
				$scope.templatePic = response.tLink;
				$scope.description = response.tDesc;
				$scope.mine = response.username == User.username && !$scope.loggedOut;
				$scope.$apply();
			});
			xhttp.send();
		}
		getTemplateInfo();
		let getIsFave = () => {
			let xhttp = customHttp("GET", "/api/fav", () => {
				if (xhttp.status != 200) {
					return;
				}
				let response = JSON.parse(xhttp.responseText);
				if (response.fav_templates.indexOf(id) >= 0) {
					$scope.favourite = true;
				}
				$scope.$apply();
			});
			xhttp.send();
		}
		getIsFave();

		let loadPosts = () => {
			let req = '/api/templatePost/' + id + '/' + $scope.postC;
			getPosts($scope, req, 12);
		}
		loadPosts();

		this.getMorePosts = () => {
			let req = '/api/templatePost/' + id + '/' + $scope.postC;
			getMorePosts($scope, req, 12);
		}
		this.loadComments = (index) => {
			loadComments($scope, index);
		}

		this.loadMoreComments = (index) => {
			loadMoreComments($scope, index);
		}

		this.addProfileComment = (index) => {
			addComment($scope, index);
		}

		this.Vote = (type, index) => {
			vote($scope, type, index);
		}

		this.toggleFavourite = () => {
			toggleFave($scope, id);
		}

		this.delete = () => {
			let confirmation = confirm("Are you sure you want to delete this Template?\n" +
				"All Memes from this template will also be deleted");
			if (!confirmation) {
				return;
			}
			let xhttp = customHttp("DELETE", '/api/template/' + id, () => {
				if (xhttp.status != 200) {
					console.log(err);
					return;
				} else {
					window.location.href = '/discover.html';
				}
			});
			xhttp.send();
		}

	});
	app.controller("templateChooseCtrl", function ($scope) {
		$scope.more = true;
		$scope.templates = [];
		$scope.count = 1;

		let getTemplates = () => {
			getNewTemplates($scope, '/api/chooseTemplates/' + $scope.count);
		}
		getTemplates();
		this.loadMoreTemplates = () => {
			getMoreTemplates($scope, '/api/chooseTemplates/' + $scope.count);
		}
		this.toggleFav = (index) => {
			toggleFave($scope, $scope.templates[index]._id, index);
		}
		this.select = (index) => {
			localStorage.ImgLink = $scope.templates[index].tLink;
			localStorage._id = $scope.templates[index]._id;
		}
	});
	//Lukasz's Image Stuff

	app.controller("UploadController", function ($scope, User) {
		$scope.errors = [false, false, false];
		$scope.errorsExist = () => {
			for (i in errors) {
				if (errors[i]) {
					return true;
				}
			}
			return false;
		}
		$scope.addFile_ = (db, desc) => {
			let tag = tags.toLowerCase();
		}

		$scope.addFile = function (db, desc, tags) {
			let tag = tags.toLowerCase();
			let f = document.getElementById("imgUpload").files[0];
			errormsg = "<ul style='list-style: circle inside !important;'>";
			errorCount = 0;
			document.getElementById("fileERROR").classList.add('hidden');
			if (f == null) {
				//console.log("MISSING IMAGE");
				document.getElementById("imgUpload").style.borderColor = "red";
				document.getElementById("fileERROR").classList.remove('hidden');
				errormsg += "<li style='list-style: circle inside !important;'> Seems like you're missing an image...</li></ul>";
				document.getElementById("fileERRORmsg").innerHTML = errormsg;
				return 1;
			}
			filename = document.getElementById("imgUpload").value.split(/(\\|\/)/g).pop();
			fileextension = filename.split('.').pop();
			//console.log(filename);
			//console.log(fileextension);

			extenionList = ["jpg", "jpeg", "png", "tiff", "gif", "JPG", "JPEG", "PNG", "TIFF", "GIF"];
			if (!(extenionList.includes(fileextension))) {
				//console.log("NO");
				errormsg += "<li style='list-style: circle inside !important;'> File Type Invalid. (Supported Typed: jpg, jpeg, png, tiff, gif)</li>";
				errorCount += 1;
			}
			if (f.size > 1024 * 1024 * 5) {
				//console.log("MISSING IMAGE");
				document.getElementById("imgUpload").style.borderColor = "red";
				errormsg += "<li style='list-style: circle inside !important;'> The image you are attempting to upload is too big. The size limit is 5.0MB</li>";
				errorCount += 1;
				return;
			}

			if (errorCount > 0) {
				errormsg += "</ul>";
				document.getElementById("fileERRORmsg").innerHTML = errormsg;
				document.getElementById("fileERROR").classList.remove('hidden');
				return 1;
			} else {
				document.getElementById("uploading-modal").setAttribute('style', 'display: block;');
				document.getElementById("uploading-modal").setAttribute('aria-hidden', 'false');
				document.getElementById("uploading-modal").classList.add('fade');
				document.getElementById("uploading-modal").classList.add('show');
				document.getElementById("uploading-modal").classList.add('fadeIn');
			}

			if (desc == "") {
				let desc = "No description provided :(";
			}

			let r = new FileReader();
			r.onloadend = function (e) {
				//console.log("Uploading image!");
				let data = e.target.result;
				let xhttp = customHttp("POST", '/api/uploadToImgur', () => {
					if (xhttp.status == 200) {
						var temp = JSON.parse(xhttp.responseText);
						localStorage.ImgLink = temp.ImgLink;
						localStorage._id = temp._id;
						//alert("Uploaded successfully! Link is: " + xhttp.responseText);
						if (db == "profilePicture") {
							window.location = "/settings.html";
						} else {
							window.location = "/editor.html";
						}
					}
					if (xhttp.status == 500) {
						//console.log(`${xhttp}`);
						alert("Image failed to upload :(");
					}
				});
				xhttp.send(JSON.stringify({
					file: data,
					database: db,
					tTags: tag,
					tDesc: desc,
					username: User.username
				}));
			}

			r.readAsDataURL(f);
		};
	});
	//Must fix these ^^
	app.controller("profileCtrl", function ($scope, User) {
		$scope.User = User;
		var q = new URLSearchParams(location.search);
		const user = q.get("username") ? q.get("username") : User.username;
		this.curTab = 0;
		this.swapTab = (tab) => {
			this.curTab = tab;
		};
		//Post stuff
		$scope.postC = 1;
		$scope.posts = [];
		$scope.numPosts = 0;
		$scope.more = true;
		$scope.moreC = true;
		$scope.voteWait = false;

		//Follow stuff
		$scope.followingC = 1;
		$scope.followersC = 1;
		$scope.isFollow = false;
		$scope.moreFollowers = true;
		$scope.moreFollowing = true;
		$scope.followerCount = 0;
		$scope.followingCount = 0;
		$scope.following = [];
		$scope.followers = [];

		//User stuff
		$scope.userDesc = null;
		$scope.user = user;
		$scope.joinDate = null;
		$scope.isMe = (user == localStorage.username) ? true : false;
		$scope.noUser = !q.get("username");

		$scope.deleteable = (username) => {
			return username == $scope.User.username;
		};
		let getUserInfo = () => {
			let xhttp = customHttp("GET", "/api/user/" +
				user, () => {
					if (xhttp.status == 404) {
						if (!$scope.noUser) {
							window.location.href = "/err/loggedin/404.html"
						}
						return;
					}
					let response = JSON.parse(xhttp.responseText);
					$scope.user = response.username;
					$scope.userDesc = response.aboutMe;
					$scope.profilePicture = response.profilePicture;
					$scope.joinDate = getDate(response.dateJoined.toString());
					$scope.$apply();
				});
			xhttp.send();
		};
		let getFollowing = () => {
			let xhttp = customHttp("GET", `/api/following/${user}/1`, () => {
				let response = JSON.parse(xhttp.responseText);
				$scope.following = response.list;
				$scope.followingCount = response.amount;
				$scope.followingC += 1;
				if (response.list.length < 8) {
					$scope.moreFollowing = false;
				}
				$scope.$apply();
			});
			xhttp.send();
		}
		let getFollowers = () => {
			let xhttp = customHttp("GET", `/api/followers/${user}/1`, () => {
				let response = JSON.parse(xhttp.responseText);
				$scope.followers = response.list;
				$scope.followerCount = response.amount;
				$scope.followersC += 1;
				if (response.list.length < 8) {
					$scope.moreFollowers = false;
				}
				$scope.$apply();
			});
			xhttp.send();
		}
		let is_following = () => {
			if (!localStorage.token) {
				return;
			}
			xhttp = customHttp("GET", "/api/is_following/" + user, () => {
				if (xhttp.status == 200) {
					$scope.isFollow = true;
				} else if (xhttp.status == 201) {
					$scope.isFollow = false;
				}
				$scope.$apply();
			});
			xhttp.send();
		}
		this.un_follow = function () {
			let toFollow = user;
			if ($scope.isMe) {
				return;
			}
			let xhttp = customHttp("POST", '/api/follow', () => {
				if (xhttp.status == 201) {
					$scope.isFollow = false;
					$scope.followerCount -= 1;
				} else {
					$scope.isFollow = true;
					$scope.followerCount += 1;
				}
				$scope.$apply();
			});
			let req = {
				toFollow: toFollow
			};
			xhttp.send(JSON.stringify(req));
		};
		this.moref = (type) => {
			let w = 2;
			if (type == "followers") {
				w = $scope.followersC;
			} else {
				w = $scope.followingC;
			}
			let req = `/api/${type}/${user}/${w}`;

			let xhttp = customHttp("GET", req, () => {
				let response = JSON.parse(xhttp.responseText);
				if (type == "following") {
					$scope.followingC += 1;
					$scope.following = $scope.following.concat(response.list);
					$scope.followingCount = response.amount;
					if (response.list.length < 8) {
						$scope.moreFollowing = false;
					}
				} else {
					$scope.followersC += 1;
					$scope.followers = $scope.followers.concat(response.list);
					$scope.followerCount = response.amount;
					if (response.list.length < 8) {
						$scope.moreFollowers = false;
					}
				}
				$scope.$apply();
			});
			xhttp.send();
		};
		let getUserPosts = () => {
			let req = '/api/post/' + user + '/' + $scope.postC;
			getPosts($scope, req, 6);
		};
		this.morep = () => {
			let req = '/api/post/' + user + '/' + $scope.postC;
			getMorePosts($scope, req, 6);
		};
		this.Vote = (type, index) => {
			vote($scope, type, index);
		};
		this.loadComments = (index) => {
			loadComments($scope, index);
		};
		this.addProfileComment = (index) => {
			addComment($scope, index);
		}
		this.loadMoreComments = (index) => {
			loadMoreComments($scope, index);
		};
		this.deletePost = (index) => {
			let confirmation = confirm("Are you sure you want to delete this Meme?");
			if (confirmation == true) {
				var req = {
					_id: $scope.posts[index].post._id
				};
				let xhttp = customHttp("DELETE", "/api/post", () => {
					if (xhttp.status != 200) {
						console.log("should do something here");
						return;
					} else {
						location.reload();
					}
				});
				xhttp.send(JSON.stringify(req));
			}
		}
		//Init stuff
		getUserInfo();
		getFollowers();
		getFollowing();
		getUserPosts();
		is_following();

	});
})();