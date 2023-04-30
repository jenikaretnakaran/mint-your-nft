/* eslint-disable react-hooks/exhaustive-deps */

import { useRef, useEffect } from "react";

const Canvas = ({ onImageGenerated }) => {

//   console.log("Generating image..........");
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // console.log(canvas);

    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");

    // Generate random color
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // Function to get brightness of a color
    const getBrightness = (color) => {
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    // Check brightness of color and set text color
    const brightness = getBrightness(randomColor);
    const textColor = brightness > 127 ? "#000000" : "#FFFFFF";

    // Draw rectangle with random color
    ctx.fillStyle = randomColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate and draw random words in the center
    const firstWords = [
      "Seven",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
    ];
    const secondWords = [
      "Red",
      "Green",
      "Yellow",
      "Blue",
      "Orange",
      "White",
      "Black",
      "Purple",
      "Pink",
      "Grey",
      "Brown",
      "Indigo",
      "Maroon",
      "Magenta",
      "Violet",
    ];
    const thirdWords = [
      "Pencils",
      "Balls",
      "Books",
      "Bottles",
      "Cycles",
      "Boxes",
      "Socks",
      "Bags",
      "Flowers",
      "Fruits",
      "Vehicles",
      "Dresses",
    ];
    // const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomWords = `${
      firstWords[Math.floor(Math.random() * firstWords.length)]
    } ${secondWords[Math.floor(Math.random() * secondWords.length)]} ${
      thirdWords[Math.floor(Math.random() * thirdWords.length)]
    }`;

    ctx.font = "20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(randomWords, canvas.width / 2, canvas.height / 2);

    // Create metadata object
    const metadata = {
      name: randomWords,
      description: "A random image with random words and colour",
      image: canvas.toDataURL(),
      attributes: [
        {
          trait_type: "Background colour",
          value: randomColor,
        },
        {
          trait_type: "Text colour",
          value: textColor,
        },
      ],
    };
    // Convert canvas to blob
    canvas.toBlob((blob) => {
        const ipfsObject = {
            metadata,
            image: {
                data: blob,
                type: "image/jpeg",
            },
        };
        onImageGenerated(ipfsObject);
    }, "image/jpeg");
  },[]);

  return <canvas ref={canvasRef} width="400" height="400"/>
};

export default Canvas;
