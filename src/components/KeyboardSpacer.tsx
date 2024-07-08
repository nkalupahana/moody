import { Capacitor } from "@capacitor/core";
import { Keyboard, KeyboardInfo } from "@capacitor/keyboard";
import { MutableRefObject, useEffect, useState } from "react";

interface Props {
    externalRef?: MutableRefObject<number>;
}

const KeyboardSpacer = ({ externalRef } : Props) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (Capacitor.getPlatform() === "web") return;
        const show = (info: KeyboardInfo) => {
            setKeyboardHeight(info.keyboardHeight);
        };
        
        const hide = () => {
            setKeyboardHeight(0);
        };

        Keyboard.addListener("keyboardWillShow", show);
        Keyboard.addListener("keyboardWillHide", hide);
        Keyboard.addListener("keyboardDidShow", show);
        Keyboard.addListener("keyboardDidHide", hide);

        return () => {
            Keyboard.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        if (!externalRef) return;
        externalRef.current = keyboardHeight;
    }, [keyboardHeight, externalRef]);

    return <div style={{"height": `${keyboardHeight + 50}px`, width: "100%"}}></div>
}

export default KeyboardSpacer;