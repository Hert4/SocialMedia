import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  followerUnFollowerUser,
  updateUser,
  getUserProfile
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();

/* Vì nếu code ở middleware ở đây nó sẽ rất dài
login
followw
signup
...
Mỗi middleware tốn mất ~30 line code
Vì vậy cần controller
*/

router.get("/profile/:query", getUserProfile);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followerUnFollowerUser);
router.put("/update/:id", protectRoute, updateUser);

export default router;
