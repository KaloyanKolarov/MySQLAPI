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

    // Users
    // add user in the database
    router.post("/users", function(req, res) {
        if (validator.validate(req.body.email)) {
            var query = "INSERT INTO ??(??,??) VALUES (?,?)";
            var table = ["user_login", "user_email", "user_password", req.body.email, md5(req.body.password)];
            query = mysql.format(query, table);

            connection.query(query, function(err, rows) {
                if (err) {
                    res.json({
                        "Message": err.message // "Error executing MySQL query"
                    });
                } else {
                    res.json({
                        "Message": "User Added!",
                        "User": req.body.email,
                        "User_ID": rows.insertId
                    });
                }
            });
        } else {
            res.json({
                "Error": "Invalid email address"
            });
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
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({
                        "Message": "Success",
                        "Users": rows
                    });
                } else {
                    res.json({
                        "Message": "No users in the table"
                    });
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
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({
                        "Message": "Success",
                        "Users": rows
                    });
                } else {
                    res.json({
                        "Message": "No such ID"
                    });
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
                        "Message": err.message
                    });
                } else {
                    if (rows.affectedRows === 1) {
                        if (rows.changedRows === 1) {
                            res.json({
                                "Message": "Updated the password for email " + req.body.email
                            });
                        } else {
                            res.json({
                                "Message": "The password is the same"
                            });
                        }
                    } else {
                        res.json({
                            "Message": "No such user"
                        });
                    }
                }
            });
        } else {
            res.json({
                "Message": "Invalid email address"
            });
        }
    });

    // delete user by email
    router.delete("/users/:email", function(req, res) {
        var query = "DELETE from ?? WHERE ??=?";
        var table = ["user_login", "user_email", req.params.email];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                res.json({
                    "Message": "Deleted the user with email " + req.params.email
                });
            }
        });
    });

    // User Status
    // set user status
    router.post("/statuses", function(req, res) {
        var query = "INSERT INTO ??(??,??) VALUES (?,?)";
        var table = ["user_status", "user_id_fk", "status_text", req.body.userId, req.body.status];
        query = mysql.format(query, table);

        connection.query(query, function(err, rows) {
            if (err) {
                if (err.errno === 1062) {
                    res.json({
                        "Message": "Record with such user ID already exists"
                    });
                } else {
                    if (err.errno === 1452) {
                        res.json({
                            "Message": "Record with such user ID doesn't exist"
                        });
                    } else {
                        res.json({
                            "Message": err.message
                        });
                    }
                }
            } else {
                res.json({
                    "Message": "Status Added!",
                });
            }
        });
    });

    // get all statuses
    router.get("/statuses", function(req, res) {
        var query = "SELECT * FROM ??";
        var table = ["user_status"];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({
                        "Message": "Success",
                        "Statuses": rows
                    });
                } else {
                    res.json({
                        "Message": "No statuses in the table"
                    });
                }
            }
        });
    });

    // get specific status by user ID
    router.get("/statuses/:user_id", function(req, res) {
        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["user_status", "user_id_fk", req.params.user_id];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({
                        "Message": "Success",
                        "Status": rows
                    });
                } else {
                    res.json({
                        "Message": "No such ID"
                    });
                }
            }
        });
    });

    // update user's status by status ID
    router.put("/statuses", function(req, res) {
        var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
        var table = ["user_status", "status_text", req.body.status, "user_status_id", req.body.statusId];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                if (rows.affectedRows === 1) {
                    if (rows.changedRows === 1) {
                        res.json({
                            "Message": "Status updated"
                        });
                    } else {
                        res.json({
                            "Message": "There is no difference between the two values"
                        });
                    }
                } else {
                    res.json({
                        "Message": "No such status ID"
                    });
                }
            }
        });
    });

    // delete status by status ID
    router.delete("/statuses/:statusId", function(req, res) {
        var query = "DELETE from ?? WHERE ??=?";
        var table = ["user_status", "user_status_id", req.params.statusId];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                res.json({
                    "Message": "Status deleted"
                });
            }
        });
    });

    // User Info
    // set user info
    router.post("/info", function(req, res) {
        var query = "INSERT INTO ??(??,??,??) VALUES (?,?,?)";
        var table = ["user_info", "user_id_fk", "user_name", "user_location", req.body.userId, req.body.name, req.body.location];
        query = mysql.format(query, table);

        connection.query(query, function(err, rows) {
            if (err) {
                if (err.errno === 1062) {
                    res.json({
                        "Message": "Record with such ID already exists"
                    });
                } else {
                    if (err.errno === 1452) {
                        res.json({
                            "Message": "Record with such ID doesn't exist"
                        });
                    } else {
                        res.json({
                            "Message": err.message
                        });
                    }
                }
            } else {
                res.json({
                    "Message": "Info Added!",
                });
            }
        });
    });

    // get all info
    router.get("/info", function(req, res) {
        var query = "SELECT * FROM ??";
        var table = ["user_info"];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({
                        "Message": "Success",
                        "Information": rows
                    });
                } else {
                    res.json({
                        "Message": "No information in the table"
                    });
                }
            }
        });
    });

    // get specific status by user ID
    router.get("/info/:user_id", function(req, res) {
        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["user_info", "user_id_fk", req.params.user_id];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                if (rows.length) {
                    res.json({
                        "Message": "Success",
                        "Information": rows
                    });
                } else {
                    res.json({
                        "Message": "No such ID"
                    });
                }
            }
        });
    });

    // update user's info by info ID
    router.put("/info", function(req, res) {
        var query = "UPDATE ?? SET ?? = ?,?? = ? WHERE ?? = ?";
        var table = ["user_info", "user_name", req.body.name, "user_location", req.body.location, "user_info_id", req.body.infoId];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                if (rows.affectedRows === 1) {
                    if (rows.changedRows === 1) {
                        res.json({
                            "Message": "Information updated"
                        });
                    } else {
                        res.json({
                            "Message": "There is no difference between the two values"
                        });
                    }
                } else {
                    res.json({
                        "Message": "No such info ID"
                    });
                }
            }
        });
    });

    // delete info by info ID
    router.delete("/info/:infoId", function(req, res) {
        var query = "DELETE from ?? WHERE ??=?";
        var table = ["user_info", "user_info_id", req.params.infoId];
        query = mysql.format(query, table);
        connection.query(query, function(err, rows) {
            if (err) {
                res.json({
                    "Message": err.message
                });
            } else {
                res.json({
                    "Message": "Info deleted"
                });
            }
        });
    });
};