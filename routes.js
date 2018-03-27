var mysql = require("mysql");
var validator = require("email-validator"); // npm install email-validator\

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

module.exports = function(router, connection, md5) {
    router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    // app.use('/api/v1', router);

    // check if the server is working
    router.get("/", function(req, res) {
        res.json({ "Message": "Hello World!" });
    });

    // add user in the database
    router.post("/users", function(req, res) {
        if (validator.validate(req.body.email)) {
            var query = "INSERT INTO ??(??,??) VALUES (?,?)";
            var table = ["user_login", "user_email", "user_password", req.body.email, md5(req.body.password)];
            query = mysql.format(query, table);

            connection.query(query, function(err, rows) {
                if (err) {
                    res.json({
                        "Error": true,
                        "Message": err.message // "Error executing MySQL query"
                    });
                } else {
                    res.json({
                        "Error": false,
                        "Message": "User Added!",
                        "User": req.body.email,
                        "User_ID": rows.insertId
                    });
                }
            });
        }
        else {
            res.json({
                "Error": "Invalid email address"
            })
        }
    });

    // get all users
    router.get("/users", function(req, res) {
        var query = "SELECT * FROM ??";
        var table = ["user_login"];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({ 
                    "Error": true, 
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({ 
                        "Error": false, 
                        "Message": "Success", 
                        "Users": rows 
                    });
                }
                else {
                    res.json({
                        "Message": "No users in the table"
                    })
                }
            }
        });
    });

    // get user by ID
    router.get("/users/:user_id", function(req, res) {
        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["user_login", "user_id", req.params.user_id];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({ 
                    "Error": true, 
                    "Message": err.message 
                });
            } else {
                if (rows.length) {
                    res.json({ 
                        "Error": false, 
                        "Message": "Success", 
                        "Users": rows 
                    });
                }
                else {
                    res.json({
                        "Message": "No such ID"
                    })
                }
            }
        });
    });

    // update user by email address
    router.put("/users", function(req, res) {
        if (validator.validate(req.body.email)) {
            var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
            var table = ["user_login", "user_password", md5(req.body.password), "user_email", req.body.email];
            query = mysql.format(query, table);
            connection.query(query, function(err, rows) {
                if (err) {
                    res.json({ 
                        "Error": true, 
                        "Message": err.message
                    });
                } else {
                    if(rows.affectedRows === 1) {
                        if (rows.changedRows === 1) {
                            res.json({ 
                                "Error": false, 
                                "Message": "Updated the password for email " + req.body.email 
                            });
                        }
                        else {
                            res.json({
                                "Message": "The password is the same"
                            })
                        }
                    } 
                    else {
                        res.json({
                            "Message": "No such user"
                        })
                    }                   
                }
            });
        }
        else {
            res.json({
                "Message": "Invalid email address"
            })
        }
    });

    // delete user by email
    router.delete("/users/:email", function(req, res) {
        var query = "DELETE from ?? WHERE ??=?";
        var table = ["user_login", "user_email", req.params.email];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({ "Error": true, "Message": "Error executing MySQL query" });
            } else {
                res.json({ "Error": false, "Message": "Deleted the user with email " + req.params.email });
            }
        });
    });
}