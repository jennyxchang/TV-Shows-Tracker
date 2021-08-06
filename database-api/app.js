var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");

var app = express();

app.set("port", process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

mongoose.connect(`${process.env.MONGODB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true });

const tvShowSchema = {
    title: String,
    season: Number,
    episode: Number,
    ongoingSeries: Number,
    dateLastWatched: Date
};

const TvShow = mongoose.model("TvShow", tvShowSchema);

const getAllTvShows = function (res) {
    TvShow.find({}, function (err, allTvShows) {
        if (err) {
            console.log(err);
            return;
        }
        res.json({ "rows": allTvShows });
    });
};

app.get("/", function (req, res) {
    getAllTvShows(res);
});

app.post("/", function (req, res) {
    const aTvShow = new TvShow({
        title: req.body.title,
        season: req.body.season,
        episode: req.body.episode,
        ongoingSeries: req.body.ongoingSeries,
        dateLastWatched: req.body.dateLastWatched
    });
    aTvShow.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        getAllTvShows(res);
    });
});

app.delete("/", function (req, res) {
    TvShow.findByIdAndRemove(req.body._id, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        getAllTvShows(res);
    });
});

app.put("/", function (req, res) {
    TvShow.updateOne({ _id: req.body._id },
        {
            title: req.body.title,
            season: req.body.season,
            episode: req.body.episode,
            ongoingSeries: req.body.ongoingSeries,
            dateLastWatched: req.body.dateLastWatched
        }, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            getAllTvShows(res);
        });
});

app.listen(app.get("port"), function () {
    console.log("Express server started; press Ctrl-C to terminate.");
});
