# face-api
1. Extract faces from metadata provided by lightroom in exif

   `python lightroomFaceExtractor.py ./images_test/`

2. Start the training

   `yarn train` OR `npm run train`  

   - --input="INPUT_PATH_OF_FACES_EXTRACTED_FROM #1"
   - --ouput="OUTPUT_PATH_OF_JSON_LABELLED_DESCRIPTORS"

3. Predict images

   `yarn predict` OR `npm run predict`  