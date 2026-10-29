import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";



// register
export const register = async (req, res)=>{
    try {
        const {name, email, password} = req.body;


        // checking fileds are not empty
        if(!name || !email || !password){
            return res.status(400).json({
                message: "All fields are required"
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
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}



// login

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        // validation
        if(!email || !password){
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