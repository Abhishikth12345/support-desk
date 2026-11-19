
/* 

What is a Router() ?

Express Router helps us organize API endpoints seperately instead of putting everything inside app.ts.

what does this mean?

router.post("/register",registerUser);

It means:
i. post: HTTP POST request
ii. /register: API path
iii. registerUser: Controller function that handles the request.   

*/

import { Router } from "express";
import {
    registerUser,
    loginUser
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;


