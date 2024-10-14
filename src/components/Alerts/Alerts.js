import React, { useEffect } from 'react';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { View, Button } from 'react-native';

const Alert = ({ type, title, text, onClose }) => {

  useEffect(() => {
    // Mostrar Dialog o Toast solo cuando el componente se ha montado o los props cambian
    if (type === ALERT_TYPE.SUCCESS || type === ALERT_TYPE.DANGER || type === ALERT_TYPE.WARNING) {
      Dialog.show({
        type: type,
        title: title,
        textBody: text,
        button: 'Cerrar',
        onHide: onClose, 
      });
    } else {
      Toast.show({
        type: type,
        title: title,
        textBody: text,
        onHide: onClose, 
      });
    }

    return () => {
      Dialog.hide();
      Toast.hide();
    };
  }, [type, title, text, onClose]); 

  return (
    <AlertNotificationRoot>
      <View>
        {/* Tu lógica del contenido del componente aquí */}
      </View>
    </AlertNotificationRoot>
  );
};

export default Alert;
