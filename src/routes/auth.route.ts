
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

/* 3. Route implementation review
Your auth.route.ts is clean.
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;


And in app.ts:
app.use("/api/auth", authRoutes);


Express combines these paths.

Therefore:
Route definition	Actual endpoint
/register	POST /api/auth/register
/login	POST /api/auth/login

This is called route mounting.  */

import { Router } from "express";
import {
    registerUser,
    loginUser,
    getProfile
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

export default router;


