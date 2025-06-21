ALTER TABLE app_user
ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE;




INSERT INTO APP_USER (ID, NAME, PASSWORD, ADDRESS, EMAIL, CART_ID, IMAGE, DOB, PHONE, isAdmin)
VALUES 
(21, 'Azizul Hakim', '$2b$08$PSyjwxvcW53OZ/whRpRW.eI7G2w9CnLU/xJ1VQOUlCgrvxfGlOhzW', 'Ahsanullah Hall,BUET', 'azizul@gmail.com', null, null, null, '01844921505', FALSE),
(41, 'Fahim Hossain', '$2b$08$xnuPq9ALDxEqf/MzFGytXe00DiCKAnEGdT2/jBuWeZk6CjudCgBT2', 'Titumir Hall,BUET', 'fahim@gmail.com', null, null, '2007-09-13', '0183242433', TRUE),
(67, 'Adil', '$2b$08$U9ZjxgyNFZt07IBQmLtwx.XGVBTWzfGL1DHwlWYsgBlcd7xXmOUbS', 'user.address', 'Adil@gmail.com', null, null, null, null, FALSE),
(101, 'Abid', '$2b$08$nkFP1HjzscuCrtBCCEKUj.Jb.vUDi5P.H2uLlYQLHVurHaUjf.OEC', 'user.address', 'Abid@gmail.com', null, null, '1999-12-14', null, FALSE),
(141, 'Safwan', '$2b$08$KS9iYlr4J1IY6dszmMM9r.ZSgwLJo6MZMpesmRGaj1eFGDhzD/bEG', 'user.address', 'safwan@gmail.com', null, null, null, null, FALSE),
(81, 'Fuad', '$2b$08$kzsveDbaY0zIDaJuM8jNleb0fjnuPqA3Zg2wddng/E9XeDL2io2um', 'user.address', 'Fuad@gmail.com', null, null, null, null, FALSE),
(24, 'Tonmoy', '$2b$08$yjfaNI6q9ST1VnfxnC5cY.DM8dBzeeG.FlyF7hwovRg/DqhauEmPy', 'user.address', 'Tonmoy@gmail.com', null, null, '1999-02-19', '01723218292', FALSE),
(121, 'Tasirul Umor', '$2b$08$Yq6CZekcB7rHOsxpczPz1ek1LRXsNZSPe/r8Gw10uIWgDFIEdL30a', 'user.address', 'umor@gmail.com', null, null, null, null, FALSE),
(122, 'Pavel', '$2b$08$KqSvtKu4t8IMbfBUFXhE0.kl17497/zTEpadcidY0rb.JKzsky3Oq', 'user.address', 'pavel@gmail.com', null, null, null, null, FALSE),
(123, 'Bayazid', '$2b$08$27ZNAr6pydiuNqf5kwcaYewcjOoym6LEgrgb6OPNyvCzkWw.HJdDy', 'user.address', 'bayazid@gmail.com', null, null, null, null, FALSE)
ON CONFLICT (ID) DO UPDATE SET
  NAME = EXCLUDED.NAME,
  PASSWORD = EXCLUDED.PASSWORD,
  ADDRESS = EXCLUDED.ADDRESS,
  EMAIL = EXCLUDED.EMAIL,
  CART_ID = EXCLUDED.CART_ID,
  IMAGE = EXCLUDED.IMAGE,
  DOB = EXCLUDED.DOB,
  PHONE = EXCLUDED.PHONE,
  isAdmin = EXCLUDED.isAdmin;
