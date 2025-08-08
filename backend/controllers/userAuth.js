const userCollection = require("../model/userModel");
const bcrypt = require("bcrypt");

// signup route
const Signup = async (req, res) => {
    const { email, password } = req.body;

    // Check if email is a string and contains "@", and password is not empty
    if (
        typeof email !== "string" ||
        !email.includes("@") ||
        typeof password !== "string" ||
        password === ""
    ) {
        return res.status(400).send({ Errmsg: "Invalid email or password" });
    }

    try {
        // Check if a user with the provided email already exists
        const existingUser = await userCollection.findOne({ email });

        if (existingUser) {
            return res.status(400).send({ Errmsg: "User already exists" });
        }

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).send({ Errmsg: "Avatar file is required" });
        }

        // Hash the password
        const hashedPw = await bcrypt.hash(password, 12);

        // Save the filename or file path to the user document in the database
        const newUser = new userCollection({
            email,
            password: hashedPw,
            userAvatar: req.file.filename,
        });

        // Save the new user to the database
        await newUser.save();

        // Redirect the user to the login page after successful signup
        res.status(200).send({ success: true });
    } catch (err) {
        console.error(err); // Log the error for debugging purposes
        res.status(500).send({ msg: "Failed to save data" });
    }
};

// login
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)

    try {
        const existingUser = await userCollection.findOne({ email });

        if (!existingUser) {
            return res.status(404).redirect("/api/v1/pages/login");
        }

        const checkPass = await bcrypt.compare(password, existingUser.password);

        if (!checkPass) {
            return res.status(400).send({ Errmsg: "Incorrect password" });
        }

        req.session.isAuthenticated = true;
        req.session.email = email;
        res.status(200).send({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ Errmsg: "Internal Server Error" });
    }
};

// logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/api/v1/pages/");
    });
};

// username
const userName = async (req, res) => {
    const { username } = req.body;

    if (!req.session.isAuthenticated) {
        return res.status(401).redirect("/api/v1/pages/login");
    }

    try {
        const email = req.session.email;
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(404).send({ msg: "User not found" });
        }

        user.username = username;
        await user.save();
        return res.status(200).redirect('/api/v1/pages/dashboard')
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Failed to add username" });
    }
};

// forget password 
const forgetPassword = async (req, res) => {
    try {
        // collect the user gmail form the forget password input field.
        const { user_gmail } = req.body;

        // make sure the user gmail is not empty
        if (!user_gmail == '') {
            return res.send('Gmail must not be empty');
        }

        // making sure that user-gmail is corresponding with the gmail in the Db

        const checkUserGmail = await userCollection.findOne({ email: user_gmail });

        if (checkUserGmail) {
            return res.json({ mail: checkUserGmail.email, userID: checkUserGmail._id })
        }

        return res.status(200).json({ msg: 'Please Provide a new password' })
    }
    catch (err) {
        console.log(err);

    }
}


module.exports = {
    Signup,
    login,
    logout,
    userName,
    forgetPassword
};