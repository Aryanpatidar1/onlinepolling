import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";



// register
export const register = async (req, res)=>{
    try {
        const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (
            name.length < 2 ||
            name.length > 80 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            email.length > 254 ||
            password.length < 8 ||
            password.length > 128
        ) {
            return res.status(400).json({
                message: "Provide a valid name, email, and password (8-128 characters)",
            });
        };


        // checking email already exsits or not
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({
                message: "Email already registered"
            });
        }


        // password  hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // user create kar rahe hai 
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });


        // token generate kar rahe hai
        const token = generateToken(user);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}



// login

export const login = async (req, res) => {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        // validation
        if(!email || !password || email.length > 254 || password.length > 128){
            return res.status(400).json({ message: "Email & password required" });
        }

        // agar user pahele se exists karta hai 
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // check karenge ki password match karta hai ki nhi
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid email or password" });
        }


        // check karenge ki user block hai ki nhi
        if(user.isBlocked){
            return res.status(403).json({ message: "Account is blocked by admin" })
        }

        // token generate
        const token = generateToken(user);


        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}