import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiMenu } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import frame from "../../../assets/frames/btn.png";
import arrow from "../../../assets/frames/arrow.png";
import "./header.css";
import axios from "../../../axios/axios";
import { useNavigate } from "react-router";

const Header = () => {
  const [isMenu, setIsMenu] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [tab, setTab] = useState("");
  const [open, setOpen] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);
  const [emailLogin, setEmailLogin] = useState("");
  const [emailSignup, setEmailSignup] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [passwordSignup, setPasswordSignup] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  const [dob, setDob] = useState("");

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
    });
  };

  const navigate = useNavigate();

  const handleScroll = () => {
    if (window.scrollY > 700) setShowTopButton(true);
    else setShowTopButton(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const List = ({ style, isMenu }) => {
    const menu = [
      { tag: "Home", ref: "#home" },
      { tag: "Services", ref: "#services" },
      { tag: "Members", ref: "#members" },
      { tag: "Partners", ref: "#partners" },
      { tag: "About", ref: "#about" },
    ];
    return menu.map((item) => (
      <li key={item.tag} onClick={() => isMenu(false)} className={``}>
        <a
          href={item.ref}
          onClick={() => setTab(item.tag)}
          className={tab === item.tag ? "active-link" : undefined}
        >
          {item.tag}
        </a>
      </li>
    ));
  };

  // Modal CSS

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "#080808",
    border: "2px solid #000",
    boxShadow: 24,
    // p: 4,
  };

  const handleOpen = () => {
    setLoginModal(true);
    setSignUpModal(false);
    setOpen(true);
  };
  const handleClose = () => {
    setLoginModal(true);
    setSignUpModal(false);
    setOpen(false);
  };
  const handleModalChange = () => {
    setLoginModal(false);
    setSignUpModal(true);
  };

  const saveAccessToken = (token) => {
    localStorage.setItem("accessToken", token);
  };

  const saveRefreshToken = (token) => {
    localStorage.setItem("refreshToken", token);
  };

  const removeTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  axios.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const { data } = await axios.post(
            "https://winwinsocietyweb3.com/api/auth/refresh_token",
            {
              refreshToken,
            }
          );

          if (data && data.token) {
            saveAccessToken(data.token);

            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Error during token refresh:", refreshError);
        }
      } else if (error.response.status === 401 && originalRequest._retry) {
        removeTokens();
        navigate("/");
      }

      return Promise.reject(error);
    }
  );

  const handleLogin = async () => {
    setLoginModal(true)
    try {
      const loginBody = {
        email: emailLogin,
        password: passwordLogin,
      };

      const { data } = await axios.post(
        "https://winwinsocietyweb3.com/api/auth/login",
        loginBody
      );

      if (data && data.token) {

        console.log("Login successful");
        saveAccessToken(data.token);
        saveRefreshToken(data.refreshToken);
        setLoginModal(false)
        console.log(loginStatus);
      } else {
        console.error("Error: No token received");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Error during login");
    }
  };

  const handleLogout = () => {
    removeTokens();
    setLoginStatus(false);
    alert("Logout Successfully");
  };

  const handleSignUp = async () => {
    console.log({ emailSignup, passwordSignup, dob });

    const signupBody = {
      email: emailSignup,
      password: passwordSignup,
      birthday: dob,
    };
    try {
      if ((emailSignup && passwordSignup, dob)) {
        const { data } = await axios.post(
          "https://winwinsocietyweb3.com/api/auth/signup",
          signupBody
        );
        if (data.success === 1) {
          console.log(signUpModal);
          alert("Sign up Successful");
          setSignUpModal(false);
          setLoginModal(true);
        } else {
          alert(error.message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const access_token = localStorage.getItem("accessToken")
    if (access_token) {
      setLoginStatus(true)
    } else {
      setLoginStatus(false)
    }
  }, [loginStatus])


  return (
    <>
      <header className="header">
        <p className="header__logo-title">
          Darknight <span className="text-effect">Labs</span>
        </p>
        {/* <img src={logo} alt="logo" className="header__img" /> */}

        {/* Mobile nav */}

        <button onClick={() => setIsMenu(true)} className="header__btn">
          <HiMenu />
        </button>

        {isMenu && (
          <motion.nav
            initial={{ y: "-100vh" }}
            animate={{ y: "0vh" }}
            transition={{
              ease: "linear",
              duration: 0.2,
            }}
            className=" header__menu "
          >
            <button
              className="header__menu__btn"
              onClick={() => setIsMenu(false)}
            >
              <AiOutlineClose />{" "}
            </button>
            <ul className="header__menu__list ">
              <List isMenu={setIsMenu} />
            </ul>
          </motion.nav>
        )}

        {showTopButton && (
          <img
            src={arrow}
            alt="top-arrow"
            className="header__scroll-img"
            onClick={scrollToTop}
          />
        )}

        {/* Desktop nav */}

        <div className="header__desktop-nav ">
          <nav>
            <ul>
              <List isMenu={setIsMenu} />
            </ul>
          </nav>

          <a href="#footer" className="header__desktop__btn">
            Contact us
          </a>

          {/* modal for login / signup */}
          {!loginStatus ? (
            <a className="header__desktop__btn" onClick={handleLogout}>
              Logout
            </a>
          ) : (<a className="header__desktop__btn" onClick={handleLogin}>
            Login/Signup
          </a>)}
        </div>
      </header >
      {loginModal && (
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <div style={{ position: "relative" }}>
              <div className="frame-container">
                <img src={frame} />
                <button style={{ color: "red" }} onClick={handleClose}>
                  Close
                </button>
                <div className="input-area">
                  <div className="email-input">
                    <label htmlFor="loginEmail">Email:</label>
                    <input
                      type="email"
                      name="loginEmail"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                    />
                  </div>
                  <div className="password-input">
                    <label htmlFor="loginPassword">Password:</label>
                    <input
                      type="password"
                      name="loginPassword"
                      value={passwordLogin}
                      onChange={(e) => setPasswordLogin(e.target.value)}
                    />
                  </div>
                  <button className="login-btn" onClick={handleLogin}>
                    Login
                  </button>
                  <p>
                    New Here? <span onClick={handleModalChange}>Sign Up</span>
                  </p>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      )
      }

      {
        signUpModal && (
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <div style={{ position: "relative" }}>
                <div className="frame-container">
                  <img src={frame} />
                  <button style={{ color: "red" }} onClick={handleClose}>
                    Close
                  </button>
                  <div className="input-area">
                    <div className="email-input">
                      <label htmlFor="email">Email:</label>
                      <input
                        type="text"
                        name="email"
                        value={emailSignup}
                        onChange={(e) => setEmailSignup(e.target.value)}
                      />
                    </div>
                    <div className="password-input">
                      <label htmlFor="password">Password:</label>
                      <input
                        type="password"
                        name="password"
                        value={passwordSignup}
                        onChange={(e) => setPasswordSignup(e.target.value)}
                      />
                    </div>
                    <div className="password-input">
                      <label htmlFor="dob">Birthday:</label>
                      <input
                        type="date"
                        name="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                    <button className="signup-btn" onClick={handleSignUp}>
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
        )
      }
    </>
  );
};

export default Header;
