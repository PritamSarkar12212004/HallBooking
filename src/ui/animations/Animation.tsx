import React from "react";
import LottieView from "lottie-react-native";

export default function Animation({ path, width, height }: {
    path: string;
    width: number;
    height: number
}) {
    return (
        <LottieView
            source={path}
            style={{ width: width, height: height }}
            autoPlay
            loop
        />
    );
}