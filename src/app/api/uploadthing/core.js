import { createUploadthing } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            return {}
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("✅ Archivo subido:", file.url)
            return { url: file.url, name: file.name }
        }),
}