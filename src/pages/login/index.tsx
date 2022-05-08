import { useForm } from "react-hook-form";
import { useState } from "react";
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';
import { serverBasicRequest } from '@services/serverRequests';
import validator from 'validator';
import Head from "next/head";
import Link from "next/link";
import Image from 'next/image';
import marca from '@public/marca.png';
import styles from "@styles/Index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { parseCookies } from "nookies";

export default function Login() {

  const { signIn } = useContext(AuthContext);
  const {register, setError, formState: { errors }, handleSubmit} = useForm({});
  const [eye, setEye] = useState(faEyeSlash);
  const [view, setView] = useState("password");

  const changeViewPass = (e) => {
    e.preventDefault();
    const viewEye = eye === faEyeSlash ? faEye : faEyeSlash;
    const viewType = view === "password" ? "text" : "password";
    setEye(viewEye);
    setView(viewType);
  };

  async function handleSignIn(data) {

    const signedIn = await signIn(data);

    const componentError =
    signedIn.status === 404 ?
    "email" :
    signedIn.status === 403 ?
    "password" : "";

    setError(componentError, {
      type: "validate",
      message: signedIn.description
    });

    return;
    
    // caso signedIn.status seja === 200, a página do usuário será carregada
  }

  

  return (
    <div className={styles.container}>
      <Head>
        <title>Emenu | Home</title>
      </Head>
      <div id="divImage" className={styles.containerBkg}>
        
      </div>

      <div id="divImage" className={styles.containerBkg2}>
        
      </div>

      <div className={styles.main}>
        <div className={styles.login}>

          <div className={styles.marca}>
            <Image
              src={marca}
              alt='picture'
              objectFit="cover"
            ></Image>
          </div>
          
          <form
            onSubmit={handleSubmit(handleSignIn)}
            className={styles.loginForm}
          >
            <div className={styles.inputDiv}>
              <input
                {...register("email", {
                  required: {
                  value: true,
                  message: "Informe seu e-mail."
                },
                validate: (email) => {
                  return validator.isEmail(email) || "Informe um e-mail válido."
                }})}
                name="email"
                type="text"
                className={styles.input}
                placeholder=" "
                onChange={(e) => {
                  const hasEndSpace = (/\s$/.test(e.target.value));
                  if(hasEndSpace){e.target.value = (e.target.value).substring(0, e.target.value.length-1)}
                }}
              />
              {errors.email && errors.email.type === "required" && <p>{errors.email.message}</p>}
              {errors.email && errors.email.type === 'validate' && <p>{errors.email.message}</p>}
              <span className={styles.floatLabel}>Email</span>
            </div>

            <div className={styles.inputDivPass}>
              <input
                {...register("password", {
                  required: {
                    value: true,
                    message: "Informe sua senha."
                  }})}
                name="password"
                type={view}
                className={styles.input}
                placeholder=" "
              />
              {errors.password && errors.password.type === "required" && <p>{errors.password.message}</p>}
              {errors.password && errors.password.type === 'validate' && <p>{errors.password.message}</p>}
              <span className={styles.floatLabel}>Senha</span>
              
              <FontAwesomeIcon tabIndex={-1} onClick={changeViewPass} className={styles.toggleButton} icon={eye} />
            </div>

            <div className={styles.forgotPass}>
              <Link href={{
                  pathname: "/userServices/forgotPassword",
                  query: {
                    requestId: 'lanretni6789tseuqer'
                  }
                }}
                as="/userServices/forgotPassword">
                <a tabIndex={-1} className={styles.forgotPassText}>
                  Esqueceu a senha?
                </a>
              </Link>
            </div>
            <button tabIndex={0} type="submit" className={styles.submitButton}>
              Entrar
            </button>
          </form>
          
          <div className={styles.signUp}>
            <h4 className={styles.signUpText}>Faça parte!</h4>
            <Link href={{
                pathname: '/signupPage'
              }}>
              <a className={styles.signUpButtonText}>
                CADASTRE-SE E CRIE SEU CARDÁPIO!
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


export const getServerSideProps = async (context) => {

  const serverSideRequests = serverBasicRequest(context); // Makes request sending context

  const {['__UEMAT']: token } = parseCookies(context);
  
  if(token) {
    const user = await serverSideRequests.post('/api/auth/reloadUser', {token})
    .then(response => {
      const user = response.data.user;
      return user;
    });

    if(user) {
      const routeName = (user.establishmentName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/ /g, '-');
  
      return{
        redirect:{
          destination: `/userPanel/${routeName}`,
          permanent: false
        }
      }
    }
  }
  
  return{
    props: {

    }
  }
}