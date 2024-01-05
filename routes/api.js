const mongoose = require("mongoose");
const User = require("../models/collections").User;
const Exercise = require("../models/collections").Exercise;

module.exports = function (app) {

    app.post("/api/users", async (req, res) => {
        const user = new User({ username: req.body.username });

        try {
            const newUser = await user.save();
            //console.log("users: data : " + data);
            res.json({
                "username": newUser.username,
                "_id": newUser.id
            });
        } catch (err) {
            if (err.code == 11000) {
                console.log('unique name error' + err);
                res.json({ "error": "name already exists, enter unique name" })
            } else {
                res.json({ "error": err });
                console.error('users obj: ' + err);
            }
        }
    })

    app.get("/api/users", async (req, res) => {

        try {
            const users = await User.find({}, { "log": 0, "__v": 0 })
                .exec();
            res.json(users);

        } catch (err) {
            console.log('user list error: ' + err)
            res.redirect('/');
        }

    })

    app.post("/api/users/:_id/exercises", async (req, res) => {

        let id = req.params._id;
        let date = !req.body.date ?
            new Date() :
            new Date(req.body.date);
        //console.log(new Date().toISOString().substring(0,10) + '   '+ req.body.date);
        const description = req.body.description;
        const duration = Number(req.body.duration);
        let newExercise = new Exercise({ description, duration, "date": date.toDateString() });
        try {
            const userdata = await User.findByIdAndUpdate(id,
                { $push: { log: newExercise } },
                { new: true })
            res.json({
                'username': userdata.username,
                'date': newExercise.date,
                'duration': newExercise.duration,
                'description': newExercise.description,
                '_id': userdata._id,
            });
        } catch (err) {
            console.log(err + "------> userdata = " + userdata);
            return res.json("unknown user id / error:" + err);
        }
    })

    app.get("/api/users/:_id/logs", async (req, res) => {
        console.log(req.query);
        let response = {}
        try {

            const logdata = await User.findById(req.params["_id"]);

            if (req.query.from != undefined && req.query.to != undefined) {
                let from = new Date(0);
                let to = new Date();
                if (new Date(req.query.from)) {
                    from = new Date(req.query.from);
                }
                if (new Date(req.query.to) != 'Invalid Date') {
                    to = new Date(req.query.to);
                }

                from = from.getTime();
                to = to.getTime();

                if (from > to) console.log("wrong time period")
                else {
                    logdata.log = logdata.log.filter(item => {
                        let itemDate = new Date(item.date).getTime();
                        //console.log(itemDate);
                        return itemDate >= from && itemDate <= to
                    })
                }
            }

            if (req.query.limit) {
                logdata.log = logdata.log.slice(0, req.query.limit)
            }

            let count = logdata.log.length;


            response.username = logdata.username;
            response['count'] = Number(count);
            response["_id"] = logdata["_id"];
            response.log = logdata.log;
            //console.log(response);     
            res.json(response);
        }
        catch (err) {
            return console.log('no logdata / error' + err);
        }
    })
    //clear the database from previous tests
    app.get("/api/users/remove", (req, res) => {
        let regex = /^fcc_test_/;
        User.deleteMany({ username: regex }, (err, data) => {
            if (err) console.error(err);
            else {
                let obj = User.find({});
                res.json("deleted" + obj);
            }
        });
    })
}