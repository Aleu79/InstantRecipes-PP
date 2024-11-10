import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); 
  const [translations, setTranslations] = useState({});

  // Función para traducir el texto
  const translateText = async (text) => {
    if (language === "en") return text; 

    try {
      const response = await axios.get(`https://lingva.dialectapp.org/api/v1/en/${language}/${encodeURIComponent(text)}`);
      
      return response.data.translation; 
    } catch (error) {
      console.error("Error en Lingva API:", error.response ? error.response.data : error.message);
      return text; 
    }
  };

  // Cambiar el idioma y traducir todo el contenido de la pantalla
  const toggleLanguage = async () => {
    setLanguage((prevLanguage) => {
      const newLanguage = prevLanguage === "en" ? "es" : "en";  
      // Traducir todo el contenido
      translateScreenContent(newLanguage);
      return newLanguage;
    });
  };

  // Función para traducir todo el contenido de la pantalla
  const translateScreenContent = async (newLanguage) => {
    const translated = {};
    const textsToTranslate = ["Hello", "Welcome", "Goodbye", "Change Language","Beef","Chicken",]; 
    for (let text of textsToTranslate) {
      const translatedText = await translateText(text);
      translated[text] = translatedText;
    }
    setTranslations(translated);  
  };

  return (
    <LanguageContext.Provider value={{ language, translations, translateText, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
