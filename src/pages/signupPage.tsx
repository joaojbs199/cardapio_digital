import { useForm } from 'react-hook-form';
import { useState } from "react";
import { v4 } from 'uuid';
import { createQrCode, createUser } from "@services/signupMiddleware";
import { getFileToConvert, uploadConvertedFile } from '@services/createConvertedFile'; 
import { verifyEmail } from "@services/verifyEmail";
import { checkUser } from "@services/checkUser";
import validator from 'validator'
import Head from "next/head";
import Image from "next/image";
import Link from 'next/link';
import Router from 'next/router';
import Loader from '@components/loader';
import styles from "@styles/Signup.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import placeholderLogo from "@public/placeholderLogo.png";
import marca from '@public/marca.png';

export default function SignUp() {

  const { register, setError, getValues, formState: { errors }, handleSubmit } = useForm({});
  const [eye, setEye] = useState(faEyeSlash);
  const [view, setView] = useState("password");
  const [img, setImg] = useState(placeholderLogo);
  const [display, setDisplay] = useState("block");
  const [text, setText] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [btnBackDisplay, setBtnBackDisplay] = useState("none");

  const changeViewPass = (e) => {
    e.preventDefault();
    const viewEye = eye === faEyeSlash ? faEye : faEyeSlash;
    const viewType = view === "password" ? "text" : "password";
    setEye(viewEye);
    setView(viewType);
  };

  const onSelectImage = (e) => {
    if(e.target.files && e.target.files[0]) {
      const file: any = URL.createObjectURL(e.target.files[0]);
      setImg(file);
    } else {
      setImg(placeholderLogo);
    }
  }

  async function handleSignUp(data){

    setLoading(true);
    
    const isVerified = await verifyEmail(data.email);

    if(!isVerified){

      setError("email", {
        type: "validate",
        message: "O email não pôde ser verificado."
      });
      setLoading(false);
      return;
    }

    let isUser = await checkUser(data.email)

    if(isUser.status === 200){
      setError("email", {
          type: "validate",
          message: isUser.description,
      });
      setLoading(false);
      return;
    }

    if(isUser.status === 500){
        setError("email", {
            type: "validate",
            message: isUser.description
        });
        setLoading(false);
        return;
    }

    const convertedLogo = await getFileToConvert(data.logo[0], 'logo');

    const createdLogo = await uploadConvertedFile(convertedLogo);

    if(createdLogo.status !== 200) {
      //mostrar erro geral
      setLoading(false);
      return;
    }

    data.logo = createdLogo.description;
    data.establishmentId = v4(); //Cria id do estabelecimento
    data.id = v4(); //Cria id do cliente

    const createdQrCode = await createQrCode(data.establishmentId, 'qrcode');

    if(createdQrCode.status !== 200) {
      //mostrar erro geral
      setLoading(false);
      return;
    }

    data.qrCode = createdQrCode.description;

    const createdUser = await createUser(data);

    if(createdUser.status !== 201) {
        //mostrar erro geral
        setLoading(false);
        return;
    }

    if(createdUser.status === 201) {
      setLoading(false);
      setText(true);
      setDisplay('none');
      setBtnBackDisplay('block');
    }

  }


  return (

    <div className={styles.container}>
      <Head>
        <title>Emenu | Sign-up</title>
      </Head>
      
      

      <div className={styles.main}>
        <div className={styles.signup}>
          
          <div className={styles.marca}>
            <Image
              src={marca}
              alt='picture'
              objectFit="cover"
            ></Image>
          </div>

          {text && <h4 className={styles.normalSubtitle}>Tudo pronto! Faça login e comece a criar...</h4>}
          <form style={{ display: display }} onSubmit={handleSubmit(handleSignUp)} className={styles.signupForm} encType="multipart/form-data">

            <div className={styles.inputDiv}>
              <input
                {...register('name', {
                  required: {
                    value: true,
                    message: "Precisamos saber seu nome."
                  }})}
                name="name"
                type="text"
                className={styles.input}
                placeholder=' '
              />
              {errors.name && errors.name.type === 'required' && <p>{errors.name.message}</p>}
              <span className={styles.floatLabel}>Seu nome</span>
            </div>

            <div className={styles.inputDiv}>
              <input
                {...register('email', {
                  required: {
                    value: true,
                    message: "Informe seu e-mail."
                  },
                  validate: (email) => {
                    return validator.isEmail(email) || "Informe um e-mail válido."
                  }
                })}
                name="email"
                type="text"
                className={styles.input}
                placeholder=' '
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
                {...register( "password", {
                  required: {
                    value: true,
                    message: "A senha é obrigatória."
                  },
                  minLength: {
                    value: 8,
                    message: "A senha deve conter no mínimo 8 caracteres."
                  }})}
                name="password"
                type={view}
                className={styles.input}
                placeholder=' '
              />
              {errors.password && errors.password.type === 'required' && <p>{errors.password.message}</p>}
              {errors.password && errors.password.type === 'minLength' && <p>{errors.password.message}</p>}
              <span className={styles.floatLabel}>Senha</span>

              <FontAwesomeIcon tabIndex={-1} onClick={changeViewPass} className={styles.toggleButton} icon={eye} />
            </div>

            <div className={styles.inputDiv}>
              <input
                {...register("confirmPassword", {
                  required: {
                    value: true,
                    message: "É obrigatório confirmar a senha."
                  },
                  validate: (confirmPassword) => {
                  const{ password } = getValues();
                  return confirmPassword === password || "As senhas não conferem.";
                }})}
                name="confirmPassword"
                type="password"
                className={styles.input}
                placeholder=' '
              />
              {errors.confirmPassword && errors.confirmPassword.type === 'required' && <p>{errors.confirmPassword.message}</p>}
              {errors.confirmPassword && errors.confirmPassword.type === 'validate' && <p>{errors.confirmPassword.message}</p>}
              <span className={styles.floatLabel}>Confirme a senha</span>
            </div>

            <div className={styles.inputDiv}>
              <input
                {...register('establishmentName', {
                  required: {
                    value: true,
                    message: "Precisamos do nome do seu estabelecimento."
                  }})}
                name="establishmentName"
                type="text"
                className={styles.input}
                placeholder=' '
              />
              {errors.establishmentName && errors.establishmentName.type === 'required' && <p>{errors.establishmentName.message}</p>}
              <span className={styles.floatLabel}>Nome do estabelecimento</span>
            </div>

            <div className={styles.divLogo}>
              <div className={styles.logo}>
                <Image 
                  src= { img }
                  alt= 'picture'
                  priority={true}
                  layout="fill"
                  objectFit="cover"
                ></Image>
              </div>
              
              <button className={styles.selectLogo}>
                <FontAwesomeIcon size="lg" icon={faPencil} />
                <input
                  {...register('logo')}
                  name="logo"
                  type="file"
                  className={ styles.inputFile }
                  accept=".gif,.jpg,.jpeg,.png"
                  onChange={onSelectImage}
                  required
                />
              </button>
            </div>

            <button type="submit" className={styles.submitButton}>
              Cadastrar
            </button>
            
          </form>
          <Link href="/login">
            <a target='_top' onClick={ () => Router.replace('/login')} className={styles.signupFormBack}>Voltar</a>
          </Link>
        </div>
      </div>
      { loading && <Loader />}
    </div>
  );
}
