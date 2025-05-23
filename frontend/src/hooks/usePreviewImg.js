
import { useState } from "react"
import useShowToast from "./useShowToast"

const usePreviewImg = () => {
    const [imgUrl, setImgUrl] = useState(null)
    const showToast = useShowToast()
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        console.log(file)
        if (file && file.type.includes('image/')) {

            const reader = new FileReader()
            reader.onloadend = () => {
                setImgUrl(reader.result)
            }
            reader.readAsDataURL(file)

        }else{
            showToast("Invalid file type", "Please select an image file", "error")
            setImgUrl(null)
        }
    }
    console.log(imgUrl)
    return {handleImageChange, imgUrl, setImgUrl}
}

export default usePreviewImg