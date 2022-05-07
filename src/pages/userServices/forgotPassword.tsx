import { useForm } from "react-hook-form";
import { useState } from "react";
import { sendMailLink, updateResetToken } from '@services/forgotPassMiddleware';
import { verifyEmail } from "@services/verifyEmail";
import { checkUser } from "@services/checkUser";
import { compare, hash } from "bcryptjs";
import validator from "validator";
import Head from "next/head";
import Link from "next/link";
import Loader from '@components/loader';
import styles from '@styles/ForgotPass.module.css';

export default function RedefinirSenha() {

  const {register, setError, formState: { errors }, handleSubmit } = useForm({});

  let subtitle = 'Informe o e-mail cadastrado para enviarmos o link'
  const [display, setDisplay] = useState('block');
  const [text, setText] = useState(subtitle);
  const [loading, setLoading] = useState(false);
  
  async function handleForgot(data) {

    setLoading(true);

    const isVerified = await verifyEmail(data.email);

    if (!isVerified) {
      setError("email", {
        type: "validate",
        message: "O email não pôde ser verificado.",
      });
      setLoading(false);
      return;
    }

    const isUser = await checkUser(data.email);

    if(isUser.status !== 200){
        setError("email", {
            type: "validate",
            message: isUser.description,
        });
        setLoading(false);
        return;
    }

    const sendedMailLink = await sendMailLink(data.email)

    if(sendedMailLink.status !== 200) {
      // mostrar erro no componente de avisos
      setLoading(false);
    }

    const updatedResetToken = await updateResetToken(sendedMailLink);

    if(updatedResetToken.status !== 200) {
      // mostrar erro no componente de avisos
      setLoading(false);
    }

    setLoading(false);
    subtitle = `Enviamos o e-mail de recuperação para: ${data.email}. Verifique sua caixa de entrada e acesse o link.`
    setDisplay('none');
    setText(subtitle);

  }


  
  return (
    <div className={styles.container}>
      <Head>
        <title>Easy menu | Esqueci minha senha</title>
      </Head>
      
      
      
      <div className={styles.main}>
        <div className={styles.forgot}>
          <h2 className={styles.title}>Esqueceu a senha?</h2>
          <h4 className={styles.normalSubtitle}>
            {text}
          </h4>
          <form
            onSubmit={handleSubmit(handleForgot)}
            className={styles.forgotForm}
            style={{ display: display }}
          >
            <div className={styles.inputDiv}>
              <input
                {...register("email", {
                  required: {
                    value: true,
                    message: "Informe seu e-mail.",
                  },
                  validate: (email) => {
                    return validator.isEmail(email) || "Informe um e-mail válido.";
                  },
                })}
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
              {errors.email && errors.email.type === "validate" && <p>{errors.email.message}</p>}
              <span className={styles.floatLabel}>Email</span>
            </div>
            <button type="submit" className={styles.submitButton}>
              Enviar link
            </button>
          </form>

          <Link href='/login'>
          <a className={styles.forgotFormBack}>Voltar</a>
          </Link>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export const getServerSideProps = async (context) => {

  if(!context.query.requestId) {

    return {
      redirect: {
          destination: '/login',
          permanent: false
      }
    }
  }
  
  const initHash = await hash('lanretni6789tseuqer', 12);
  const id = context.query.requestId;
  const isInternal = await compare(id, initHash);

  if(!isInternal) {

    return {
      redirect: {
          destination: '/login',
          permanent: false
      }
    }
  }

  return {
    props: {

    }
  }
}
