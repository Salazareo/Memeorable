require('./config/passportConfig');

let express = require('express');
let mongo = require('mongoose');
let bodyparser = require('body-parser');
let cors = require('cors');
let path = require('path');
let app = express();
let route = require("./routes/route");
let resetPassword = require("./routes/resetPassword")
let notifications = require("./routes/notifications");
let passport = require('passport');
let port = 8569;

app.use(passport.initialize());

mongo.connect('mongodb://localhost:27017/Memeorable', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});

mongo.connection.on('connected', () => {
    console.log("Database: Mongo is GO chief. I repeat, Mongo is GO!");
});
mongo.connection.on('err', () => {
    console.log("Database: We need backup! Mongo down! I repeat, Mongo down!")
});
app.use(cors());

app.use(bodyparser.json({
    limit: '5mb'
}));

// Start listening
app.listen(port, () => {
    console.log("Server: Chief, do you copy? I'm in on port " + port);
    exports.startTime = (new Date).getTime() / 1000;
});

app.get("/share.html", (req, res) => {
    fs.readFile("./public/share.html", 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.sendFile("/public/share.html", {
                root: __dirname
            });
        } else {
            let Post = require('./models/posts');
            let queryId = req.query.id;
            Post.findById(queryId, {
                pLink: 1
            }, (err, post) => {
                if (err) {
                    console.error(err);
                    res.sendFile("/public/share.html", {
                        root: __dirname
                    });
                } else {
                    var newValue = data.replace(/<meta property="og:image" content=".*">/m,
                        "<meta property=\"og:image\" content=\"" + post.pLink + "\">");
                    fs.writeFile("./public/share.html", newValue, 'utf-8', (err) => {
                        if (err) {
                            console.error(err);
                        }
                        res.sendFile("/public/share.html", {
                            root: __dirname
                        });
                    });
                }
            });

        }
    });
});
app.use(express.static(path.join(__dirname, "public")));

app.use('/api', route);
app.use('/api', resetPassword);
app.use('/api', notifications);

// Send to main
app.get("/", (req, res) => {
    res.sendFile("/public/index.html", {
        root: __dirname
    });
});

// If no proper request: 404 and forward to error handler
app.use((req, res, next) => {
    res.sendFile("/public/err/loggedin/404.html", {
        root: __dirname
    });
});