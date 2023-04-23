import { create} from "@pinata/sdk";
require("dotenv").config();

const pinata = create({
    apiKey: process.env.PINATA_API_KEY,
    apiSecret: process.env.PINATA_API_SECRET_KEY,
})

function makeAnEpicNFT() {
    pinata
        .pinJSONToIPFS(json)
        .then((result) => {
            
        })
}