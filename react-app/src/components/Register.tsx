import React from "react";
import styles from "./Register.module.css";

const Register: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Left Side - Image & Tagline */}
        <div className={styles.imageSection}>
          {/* <button className={styles.backButton}>Back to website →</button> */}

          <video className={styles.videoBackground} autoPlay loop muted playsInline>
            <source src="/MotionFrame/skeleton-dancing.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className={styles.videoOverlay}>
            <h2 className={styles.tagline}>From Human Motion to Animation</h2>
          </div>


        </div>

        {/* Right Side - Form */}
        <div className={styles.formSection}>
          <h1 className={styles.heading}>Create an account</h1>
          <p className={styles.subtext}>
            Already have an account? <a href="/MotionFrame/login" className={styles.link}>Log in</a>
          </p>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <input type="text" placeholder="First name" className={styles.input} />
              <input type="text" placeholder="Last name" className={styles.input} />
            </div>
            <input type="email" placeholder="Email" className={styles.input} />
            <input type="password" placeholder="Enter your password" className={styles.input} />
            <input type="password" placeholder="Re-enter your password" className={styles.input} />

            <div className={styles.checkboxGroup}>
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                I agree to the <a href="#" className={styles.link}>Terms & Conditions</a>
              </label>
            </div>

            <button type="submit" className={styles.createButton}>Create account</button>
          </form>

          <div className={styles.divider}>Or register with</div>

          <div className={styles.socialButtons}>
            <button className={styles.googleButton}>Google</button>
            <button className={styles.ghButton}>GitHub</button>
            <button className={styles.fbButton}>Facebook</button>
            <button className={styles.liButton}>LinkedIn</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
