import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { makeReset } from "@services/resetPassMiddleware";
import axios from "axios";
import { hash, compare } from 'bcryptjs';
import Head from "next/head";
import Loader from '@components/loader';
import styles from '@styles/ResetPass.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { baseURL } from "@services/baseUrlConfig";

export default function ResetSenha({ params }) {

  const { register, getValues, formState: { errors }, handleSubmit } = useForm({});

  let subtitle = "Informe a nova senha abaixo";
  const [eye, setEye] = useState(faEyeSlash);
  const [view, setView] = useState("password");
  const [display, setDisplay] = useState("block");
  const [text, setText] = useState(subtitle);
  const [loading, setLoading] = useState(false);
  const [btnBackDisplay, setBtnBackDisplay] = useState("none");
  
  const changeViewPass = (e) => {
    e.preventDefault();
    const viewEye = eye === faEyeSlash ? faEye : faEyeSlash;
    const viewType = view === "password" ? "text" : "password";
    setEye(viewEye);
    setView(viewType);
  };

  useEffect(() => {
    window.history.pushState({}, null, '/userServices/resetPassword')
  }, [])
 

  async function handleReset(data) {

    setLoading(true);

    params.password = data.password

    const response = await makeReset(params);

    subtitle = response.description;
    setDisplay("none");
    setText(subtitle);

    if(response.status === 200){
      setLoading(false);
      setBtnBackDisplay("block");
    }

  }

  




  return (
    <div className={styles.container}>
      <Head>
        <title>Easy menu | Redefinir senha</title>
      </Head>



      <div className={styles.main}>
        <div className={styles.reset}>
          <h2 className={styles.title}>Redefinir senha</h2>
          <h4 className={styles.normalSubtitle}>{text}</h4>
          <form
            onSubmit={handleSubmit(handleReset)}
            className={styles.resetForm}
            style={{ display: display }}
          >
            <div className={styles.inputDivPass}>
              <input
                {...register("password", {
                  required: {
                    value: true,
                    message: "A senha é obrigatória.",
                  },
                  minLength: {
                    value: 8,
                    message: "A senha deve conter no mínimo 8 caracteres.",
                }})}
                name="password"
                type={view}
                className={styles.input}
                placeholder=" "
              />
              {errors.password && errors.password.type === "required" && <p>{errors.password.message}</p>}
              {errors.password && errors.password.type === "minLength" && <p>{errors.password.message}</p>}
              <span className={styles.floatLabel}>Senha</span>

              <button onClick={changeViewPass} className={styles.toggleButton}>
                <FontAwesomeIcon icon={eye} />
              </button>
            </div>

            <div className={styles.inputDiv}>
              <input
                {...register("confirmPassword", {
                  required: {
                    value: true,
                    message: "É obrigatório confirmar a senha.",
                  },
                  validate: (confirmPassword) => {
                    const { password } = getValues();
                    return confirmPassword === password || "As senhas não conferem.";
                  }})}
                name="confirmPassword"
                type="password"
                className={styles.input}
                placeholder=" "
              />
              {errors.confirmPassword && errors.confirmPassword.type === "required" && <p>{errors.confirmPassword.message}</p>}
              {errors.confirmPassword && errors.confirmPassword.type === "validate" && <p>{errors.confirmPassword.message}</p>}
              <span className={styles.floatLabel}>Confirme a senha</span>
            </div>
            <button type="submit" className={styles.submitButton}>
              Alterar senha
            </button>
          </form>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}




export const getServerSideProps = async (context) => {

  const  {requestId, email, token}  = context.query;
  
  if (!requestId) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const isUser = await axios({
    method: 'POST',
    url: `${baseURL}/api/auth/isUser`,
    headers: {
      'Content-type': 'application/json'
    },
    data: { email }
  });

  if(isUser.data.status !== 200) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const initHash = await hash("lanretni6789tseuqer", 12);
  const isInternal = await compare(requestId, initHash);

  if (!isInternal) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      params:{
        email,
        token
      }
    }
  };
};