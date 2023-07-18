# Changelog

## [1.11.13](https://github.com/devoteam-se/devolunch/compare/v1.11.12...v1.11.13) (2023-07-18)


### Bug Fixes

* add pnpm to notify-slack workflow ([b106fe1](https://github.com/devoteam-se/devolunch/commit/b106fe13bf8c77c70b106cdcd30682a9bd9da0e6))

## [1.11.12](https://github.com/devoteam-se/devolunch/compare/v1.11.11...v1.11.12) (2023-07-18)


### Bug Fixes

* add cfsource.zip to git for checksum diff ([1fb9336](https://github.com/devoteam-se/devolunch/commit/1fb933633a3332a716c985ceb792a62cee6c1d21))

## [1.11.11](https://github.com/devoteam-se/devolunch/compare/v1.11.10...v1.11.11) (2023-07-18)


### Bug Fixes

* add source code triggers ([4e1600b](https://github.com/devoteam-se/devolunch/commit/4e1600b343aeecc164ada9a9d4db9f903c8d33d3))

## [1.11.10](https://github.com/devoteam-se/devolunch/compare/v1.11.9...v1.11.10) (2023-07-18)


### Bug Fixes

* scrape restaurants sequentially to reduce memory usage ([f77e3b9](https://github.com/devoteam-se/devolunch/commit/f77e3b9f1766b34d64bde8cb29b732e381291c77))

## [1.11.9](https://github.com/devoteam-se/devolunch/compare/v1.11.8...v1.11.9) (2023-07-18)


### Bug Fixes

* add build step before packing ([8509624](https://github.com/devoteam-se/devolunch/commit/8509624c16804ef4d2e0b2d1cc5eab321c5011ec))

## [1.11.8](https://github.com/devoteam-se/devolunch/compare/v1.11.7...v1.11.8) (2023-07-18)


### Bug Fixes

* add --no-frozen-lockfile to install step ([e444243](https://github.com/devoteam-se/devolunch/commit/e444243a6b97f031bfc29ccd08ca8010905d080e))

## [1.11.7](https://github.com/devoteam-se/devolunch/compare/v1.11.6...v1.11.7) (2023-07-18)


### Bug Fixes

* install pnpm in deploy step ([2bbc7c2](https://github.com/devoteam-se/devolunch/commit/2bbc7c2e4b9e31f1ef9cdb9f65fb1d75657e3774))

## [1.11.6](https://github.com/devoteam-se/devolunch/compare/v1.11.5...v1.11.6) (2023-07-18)


### Bug Fixes

* add state to gcs bucket ([fbe5bc7](https://github.com/devoteam-se/devolunch/commit/fbe5bc7ed70f107aa6cbf76b099c0032adb4ff80))

## [1.11.5](https://github.com/devoteam-se/devolunch/compare/v1.11.4...v1.11.5) (2023-07-17)


### Bug Fixes

* add environment to scraper and notify-slack ([c76b060](https://github.com/devoteam-se/devolunch/commit/c76b060aa8055bafa0eecf1e4b8db3526e1747ba))

## [1.11.4](https://github.com/devoteam-se/devolunch/compare/v1.11.3...v1.11.4) (2023-07-17)


### Bug Fixes

* add gcloud auth ([5d879f2](https://github.com/devoteam-se/devolunch/commit/5d879f2fa033956e96000b89517e5309c4ffd1ce))

## [1.11.3](https://github.com/devoteam-se/devolunch/compare/v1.11.2...v1.11.3) (2023-07-17)


### Bug Fixes

* remove source code triggers ([28e2900](https://github.com/devoteam-se/devolunch/commit/28e2900c45c93ea2b95d67000d207b02c848e802))

## [1.11.2](https://github.com/devoteam-se/devolunch/compare/v1.11.1...v1.11.2) (2023-07-17)


### Bug Fixes

* remove terraform fmt -check because of https://github.com/hashicorp/terraform/issues/31543 ([911851e](https://github.com/devoteam-se/devolunch/commit/911851eeca3255b633187359d38d61fef683fa32))
* remove unused deploy step ([4c83a00](https://github.com/devoteam-se/devolunch/commit/4c83a007e24b70d47078bcc1d627598267d336a7))

## [1.11.1](https://github.com/devoteam-se/devolunch/compare/v1.11.0...v1.11.1) (2023-07-17)


### Bug Fixes

* update github action terraform version ([6c467b2](https://github.com/devoteam-se/devolunch/commit/6c467b2644e57c8529a6ab2dfbe82fa713f32ae1))

## [1.11.0](https://github.com/devoteam-se/devolunch/compare/v1.10.1...v1.11.0) (2023-07-17)


### Features

* add github actions steps for deploying scraper and slack notifier ([20665ee](https://github.com/devoteam-se/devolunch/commit/20665ee672712671b4606a64db28da2845024d90))

## [1.10.1](https://github.com/devoteam-se/devolunch/compare/v1.10.0...v1.10.1) (2023-07-17)


### Bug Fixes

* remove type and set automatically for smak and kontrast ([2e9607f](https://github.com/devoteam-se/devolunch/commit/2e9607f997d6fba23806abf86ae6c6d5fa1a726e))
* update github url in footer ([d78ddfd](https://github.com/devoteam-se/devolunch/commit/d78ddfd66ed1de085a5c373c3ac356e61a40051a))

## [1.10.0](https://github.com/devoteam-se/devolunch/compare/v1.9.0...v1.10.0) (2023-07-17)


### Features

* add belle pastabar ([0c4d7a5](https://github.com/devoteam-se/devolunch/commit/0c4d7a51301863fb2c86a5eaca20214147275a9a))
* set type automatically depending on keywords in title and ([e2dd4ba](https://github.com/devoteam-se/devolunch/commit/e2dd4bac343249de93c02242db712eee9d837c0a))


### Bug Fixes

* sort restaurant in slack notifier ([b562902](https://github.com/devoteam-se/devolunch/commit/b5629023487e2cfa3c9a88466675a1deb7f33dfd))

## [1.9.0](https://github.com/jayway/devolunch/compare/v1.8.6...v1.9.0) (2023-07-11)


### Features

* Add kontrast västra hamnen ([88d1989](https://github.com/jayway/devolunch/commit/88d198959ea5df1cacf402948b74244cc35bad07))
* fetch images via backend ([d9698fd](https://github.com/jayway/devolunch/commit/d9698fdce64ee3fa4d3817c9f0ff3d845abbb67f))


### Bug Fixes

* assume that dishes containing 'stängt' means restaurant is closed ([39b6a47](https://github.com/jayway/devolunch/commit/39b6a47852ee334061aa41426b294346f91e8baa))
* namu image ([0a80c9f](https://github.com/jayway/devolunch/commit/0a80c9f4dd1ccceda48dcb6ecad849609869005b))
* resolve on end and close ([3eb0b66](https://github.com/jayway/devolunch/commit/3eb0b66978f0db47e2cc2943b674c1382321dd0a))


### Reverts

* "fix: resolve on end and close" ([270e9fd](https://github.com/jayway/devolunch/commit/270e9fdb5c512fd516561228305dcb288528975f))

## [1.8.6](https://github.com/jayway/devolunch/compare/v1.8.5...v1.8.6) (2023-07-10)


### Bug Fixes

* add token to release-please ([7ab3ec2](https://github.com/jayway/devolunch/commit/7ab3ec22a5041cda6328291a2ddc5af3ad25f2f2))

## [1.8.5](https://github.com/jayway/devolunch/compare/v1.8.4...v1.8.5) (2023-07-09)


### Bug Fixes

* trigger release-please on push to main ([3d6d483](https://github.com/jayway/devolunch/commit/3d6d483aa7615ea438d7b6545699f5077ffa0680))

## [1.8.4](https://github.com/jayway/devolunch/compare/v1.8.3...v1.8.4) (2023-07-09)


### Bug Fixes

* update scopes and gh workflow name ([7367bf5](https://github.com/jayway/devolunch/commit/7367bf551a7c07f34e3b39f210c15bfcd8343935))

## [1.8.3](https://github.com/jayway/devolunch/compare/v1.8.2...v1.8.3) (2023-07-08)


### Bug Fixes

* Create release on tag creation ([9c455bc](https://github.com/jayway/devolunch/commit/9c455bce896fe626a24ae8a53f9edbae2faa1998))

## [1.8.2](https://github.com/jayway/devolunch/compare/v1.8.1...v1.8.2) (2023-07-08)


### Bug Fixes

* Catch errors and (a)wait for sharp to finish ([5a71728](https://github.com/jayway/devolunch/commit/5a71728c63b4cdf04adebfc9fca9596249178dfa))
* Shared npm packages for scraper function ([f9b6c33](https://github.com/jayway/devolunch/commit/f9b6c33b106cad183be80568693229a928e060b3))

## [1.8.1](https://github.com/jayway/devolunch/compare/v1.8.0...v1.8.1) (2023-07-07)


### Bug Fixes

* add additional arm to shrug emoji ([2e46f6c](https://github.com/jayway/devolunch/commit/2e46f6cb5d6379ce1804c1d1419b937937a927dd))

## [1.8.0](https://github.com/jayway/devolunch/compare/v1.7.0...v1.8.0) (2023-07-06)


### Features

* Add open graph meta tags ([74b13b7](https://github.com/jayway/devolunch/commit/74b13b74ed3cfe91f42b23514eabb66dcbed93d6))


### Bug Fixes

* Smak scraper ([06b2de8](https://github.com/jayway/devolunch/commit/06b2de81a6f1f5795b727689940273e1ea83e6f5))

## [1.7.0](https://github.com/jayway/devolunch/compare/v1.6.1...v1.7.0) (2023-07-05)


### Features

* Replace GITHUB_TOKEN with self made PAT ([12ee9b3](https://github.com/jayway/devolunch/commit/12ee9b39eebe46d07ca3d9b38bf9ab9de2342d76))

## [1.6.1](https://github.com/jayway/devolunch/compare/v1.6.0...v1.6.1) (2023-06-30)


### Bug Fixes

* Analytics path ([d29c7d9](https://github.com/jayway/devolunch/commit/d29c7d933eda1edc2f0a248b0be39c273354334e))

## [1.6.0](https://github.com/jayway/devolunch/compare/v1.5.0...v1.6.0) (2023-06-30)


### Features

* Add plausible analytics ([9043040](https://github.com/jayway/devolunch/commit/90430402b95b861dc63c4ca42e01ad4ebbf584b4))
* Improve loading spinner ([daf0ad0](https://github.com/jayway/devolunch/commit/daf0ad0f5904e0bceba2ac58c501f0a97c716670))

## [1.5.0](https://github.com/jayway/devolunch/compare/v1.4.2...v1.5.0) (2023-06-29)


### Features

* Add namu ([0547fd5](https://github.com/jayway/devolunch/commit/0547fd5ca958b15d4dd74d17af3a742134049c36))
* Add quanbyquan ([3f3e4f0](https://github.com/jayway/devolunch/commit/3f3e4f0ec885fd9ca65206e669443ad9eb135c94))
* Remove saving to localStorage ([03c4b98](https://github.com/jayway/devolunch/commit/03c4b9864e9723fe62788da61d3544da595c66f4))


### Bug Fixes

* namu spaces ([256e347](https://github.com/jayway/devolunch/commit/256e3474a331a96cef7cbfc2974f282a1e092e97))
