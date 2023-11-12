import { v2 as cloudinary } from 'cloudinary';

const upload = (images: Express.Multer.File[]) => {
  const imageUrls = images.map((image) => {
    return { path: image.path, filename: image.filename };
  });
  return imageUrls;
};

const remove = async (imageUrls: object[]) => {
  const publicIds = imageUrls.map((imgUrl: any) => imgUrl.filename);
  await cloudinary.api.delete_resources(publicIds);
};

export { upload, remove };
