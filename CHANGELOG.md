# Changelog

# [0.14.0](https://github.com/MohammadBnei/editable-blog/compare/0.13.2...0.14.0) (2025-09-17)


### Features

* Add healthz endpoint for k8s liveness probes ([c5ddb91](https://github.com/MohammadBnei/editable-blog/commit/c5ddb910e04122019ead484d4d66eac5db710e12))
* Add liveness and readiness probes to deployment ([7e47891](https://github.com/MohammadBnei/editable-blog/commit/7e478913c7e8b03a670fd535fe7bb0d95f7078e6))
* Implement healthz endpoint ([97704e6](https://github.com/MohammadBnei/editable-blog/commit/97704e6e1e77e5b80dd431d313f862527a604f29))
* **k8s:** added compress middleware for gzip ([37a5e0e](https://github.com/MohammadBnei/editable-blog/commit/37a5e0e904f95c69d20d310a6f85882f4bebfdba))

## [0.13.2](https://github.com/MohammadBnei/editable-blog/compare/0.13.1...0.13.2) (2025-09-17)

## [0.13.1](https://github.com/MohammadBnei/editable-blog/compare/0.13.0...0.13.1) (2025-09-17)


### Bug Fixes

* Remove [@html](https://github.com/html) from title tag in svelte:head ([658a31b](https://github.com/MohammadBnei/editable-blog/commit/658a31b02c1ff971479a9f0155594421c4f9da81))
* Replace Svelte reactive declarations with `$derived` and `$effect` ([d13dcf4](https://github.com/MohammadBnei/editable-blog/commit/d13dcf42aa060c74917d343e561165e9d0bc0eb1))
* Update Svelte 5 runes syntax for page data ([04ca99e](https://github.com/MohammadBnei/editable-blog/commit/04ca99e7812edcdb190f2feae4fa142b7dc3b0cb))

# [0.13.0](https://github.com/MohammadBnei/editable-blog/compare/0.12.1...0.13.0) (2025-09-17)


### Features

* Implement SEO and social media meta tags for all pages ([7625d98](https://github.com/MohammadBnei/editable-blog/commit/7625d9850c7c65dac0e08f150b468ee37b2b9827))

## [0.12.1](https://github.com/MohammadBnei/editable-blog/compare/0.12.0...0.12.1) (2025-09-17)


### Bug Fixes

* Remove 'lang' URL parameter after language change ([a4ba0cf](https://github.com/MohammadBnei/editable-blog/commit/a4ba0cf840a6e1d7b04197eaeb634b5ae5e69fda))

# [0.12.0](https://github.com/MohammadBnei/editable-blog/compare/0.11.1...0.12.0) (2025-09-06)


### Features

* add expandable project previews in portfolio ([e9f90bb](https://github.com/MohammadBnei/editable-blog/commit/e9f90bb90db5591d9059b36dca900fe2cc38a036))
* add portfolio page with projects API and display ([6b420db](https://github.com/MohammadBnei/editable-blog/commit/6b420dbbbc511f2517faaa16fdd29938c74f12af))
* add project editing functionality in portfolio page ([35daf44](https://github.com/MohammadBnei/editable-blog/commit/35daf44c750b10c82e36e76a3372caa9344750a7))
* add projects section to portfolio page with markdown content and links ([43cf1ae](https://github.com/MohammadBnei/editable-blog/commit/43cf1ae8f7d36f995f698f17a12ad867b0c4a77b))

## [0.11.1](https://github.com/MohammadBnei/editable-blog/compare/0.11.0...0.11.1) (2025-09-05)

# [0.11.0](https://github.com/MohammadBnei/editable-blog/compare/0.10.0...0.11.0) (2025-09-03)


### Features

* **resume:** added editing option for resume ([9c185ef](https://github.com/MohammadBnei/editable-blog/commit/9c185efa0e43b3b50ab3da7a6af876056402f4d1))

# [0.10.0](https://github.com/MohammadBnei/editable-blog/compare/0.9.0...0.10.0) (2025-08-27)


### Features

* Add resume download button and dynamic filename ([7ec54a3](https://github.com/MohammadBnei/editable-blog/commit/7ec54a35b53d7efcc28e9a5024c66f7eeffeae68))
* **login:** will go to previous page instead of home after successful login. ([b7e9b44](https://github.com/MohammadBnei/editable-blog/commit/b7e9b44d394abe49023de7934f17961a80645306))

# [0.9.0](https://github.com/MohammadBnei/editable-blog/compare/0.8.0...0.9.0) (2025-08-25)


### Features

* **resume:** removed imprint page and added resume to quick link navigation ([47a893d](https://github.com/MohammadBnei/editable-blog/commit/47a893d063c31d8c087d9b056c5b2062ea6c63b5))

# [0.8.0](https://github.com/MohammadBnei/editable-blog/compare/0.7.0...0.8.0) (2025-08-24)


### Features

* Add PDF upload support to Carta attachment plugin ([532bd2b](https://github.com/MohammadBnei/editable-blog/commit/532bd2b282f5dd80f11c38b82e761ac15d876a39))

# [0.7.0](https://github.com/MohammadBnei/editable-blog/compare/0.6.0...0.7.0) (2025-08-23)


### Features

* Add resume page with dynamic content fetching ([f921e3e](https://github.com/MohammadBnei/editable-blog/commit/f921e3ef36836b9fe0b10580a07309db7fdaffc5))
* **resume page:** fixed resume page last errors ([c322e76](https://github.com/MohammadBnei/editable-blog/commit/c322e76fa3722737b15dd79c13e7cebbf7d38095))

# [0.6.0](https://github.com/MohammadBnei/editable-blog/compare/0.5.1...0.6.0) (2025-08-13)


### Features

* **src/lib/carta.ts:** add UnifiedTransformer for rehype-mermaid to transform Mermaid diagrams into SVG images ([9c70ac6](https://github.com/MohammadBnei/editable-blog/commit/9c70ac6226a2efe3fe6eef4e98ce5bc989930f7a))

## [0.5.1](https://github.com/MohammadBnei/editable-blog/compare/0.5.0...0.5.1) (2025-08-12)

# [0.5.0](https://github.com/MohammadBnei/editable-blog/compare/0.4.4...0.5.0) (2025-08-12)


### Features

* Add i18n to website teaser using currentLang store ([fc98725](https://github.com/MohammadBnei/editable-blog/commit/fc98725c6f36fc8be89c3c603034afe637429e2e))

## [0.4.4](https://github.com/MohammadBnei/editable-blog/compare/0.4.3...0.4.4) (2025-08-12)


### Bug Fixes

* **imprint:** fixed lang change not updating the content ([a65d647](https://github.com/MohammadBnei/editable-blog/commit/a65d647a2f97bc56728e93eb7b911974cda33216))

## [0.4.3](https://github.com/MohammadBnei/editable-blog/compare/0.4.2...0.4.3) (2025-08-12)

## [0.4.2](https://github.com/MohammadBnei/editable-blog/compare/0.4.1...0.4.2) (2025-08-11)

## [0.4.1](https://github.com/MohammadBnei/editable-blog/compare/0.4.0...0.4.1) (2025-08-11)


### Bug Fixes

* **richtext:** removing unused style to see if ithe hydratation error is gone ([a9436e2](https://github.com/MohammadBnei/editable-blog/commit/a9436e2ea092720f88ca89465583676771a89ca8))

# [0.4.0](https://github.com/MohammadBnei/editable-blog/compare/0.3.1...0.4.0) (2025-08-09)


### Features

* **carta:** hope it works. Markdown renderer ([397aef2](https://github.com/MohammadBnei/editable-blog/commit/397aef2478f27aa6581647891ff7c7c5064486b3))

## [0.3.1](https://github.com/MohammadBnei/editable-blog/compare/0.3.0...0.3.1) (2025-07-30)


### Bug Fixes

* Correct event binding for Cropper component ([e4d95d9](https://github.com/MohammadBnei/editable-blog/commit/e4d95d97ae0b5b21bd55be9291ff35c20251dc5e))
* Ensure cropDetail is reactive and checked before use ([4bd926e](https://github.com/MohammadBnei/editable-blog/commit/4bd926e1160de7d77d6e1eb914a20c0ab961d141))
* Remove $state from prop destructuring in Cropper.svelte ([92e5b09](https://github.com/MohammadBnei/editable-blog/commit/92e5b09563f56aa46695f91d2d337157713e8330))

# [0.3.0](https://github.com/MohammadBnei/editable-blog/compare/0.2.0...0.3.0) (2025-07-29)


### Bug Fixes

* Add default language and validation for article operations ([615acc2](https://github.com/MohammadBnei/editable-blog/commit/615acc247cdd85b2682b33b881b9fd28ce07e1e3))
* Bind testimonial in each block using array index ([ee5a43d](https://github.com/MohammadBnei/editable-blog/commit/ee5a43d3013b3839aa39033597959aa5bbc4fd5f))
* Ensure existing articles have 'en' as default language ([e446ba4](https://github.com/MohammadBnei/editable-blog/commit/e446ba452d89067b3d5c65673d4077f9d08971cc))
* Remove lang column from articles table in schema ([4312ac5](https://github.com/MohammadBnei/editable-blog/commit/4312ac5a6b88f2f73f111ff7d568288f2a2ee4ed))
* Remove language detection from updateArticle function ([883dc43](https://github.com/MohammadBnei/editable-blog/commit/883dc43ace5fbc80ef338e0d496e9d2bb02ec3cd))
* Replace reactive declarations with $derived in CreateLink.svelte ([12e7874](https://github.com/MohammadBnei/editable-blog/commit/12e78746eed491bc134d7e4acd3729195784b729))
* Update article schema for unique slug and lang composite key ([d9a7f8e](https://github.com/MohammadBnei/editable-blog/commit/d9a7f8e4c1c5989988e7ae5a8a0457bcc12f7e69))


### Features

* Add dynamic language route for redirects ([aad2eff](https://github.com/MohammadBnei/editable-blog/commit/aad2effe5735a3e0ea0ede1820ac6358d94c1da9))
* Add lang column to articles migration ([1bb72f5](https://github.com/MohammadBnei/editable-blog/commit/1bb72f5c69581139d27dac9e70489ab92f2d42c1))
* Add lang column, update existing rows, and add constraints to pages table ([8d46e80](https://github.com/MohammadBnei/editable-blog/commit/8d46e802b8b6660c2d7a66e7d2cca406937c4d4e))
* Add language detection and storage for articles ([71449f4](https://github.com/MohammadBnei/editable-blog/commit/71449f4b946faf73bb42a0570e5f4f5635dac4af))
* Add language parameter to createArticle function ([cbc0d77](https://github.com/MohammadBnei/editable-blog/commit/cbc0d7780c55b12f19fd643a7bca55586359fdb7))
* Add language switcher to WebsiteNav ([af3d733](https://github.com/MohammadBnei/editable-blog/commit/af3d733c8a99c6469a47528e3827a6e1da89ab08))
* Add localization to pages and API endpoints ([98047ee](https://github.com/MohammadBnei/editable-blog/commit/98047eea5c71b3b5c52adb49453ee8af00c8c690))
* Add migration to enforce 2-character length for article lang codes ([f8a33e7](https://github.com/MohammadBnei/editable-blog/commit/f8a33e744bdf76efbc075349402566e89fb653ba))
* Add N8N_TRANSLATION_WEBHOOK_URL and lang parameter to webhooks ([1541935](https://github.com/MohammadBnei/editable-blog/commit/15419359db919486249b739535174888c73e6153))
* Add pgweb and n8n services to compose.yml ([09f15b7](https://github.com/MohammadBnei/editable-blog/commit/09f15b7fe3cb633af2d9c86f8fff39e5908805c1))
* Implement database migrations and update article API for lang support ([0cd85a4](https://github.com/MohammadBnei/editable-blog/commit/0cd85a4a4b1af168028fe0a9e8b093a5eb687054))
* Implement language selection via query parameters ([cc844e5](https://github.com/MohammadBnei/editable-blog/commit/cc844e536cd422f5bc67f0015a334c261d5b0042))
* Implement language switching functionality ([08f4f93](https://github.com/MohammadBnei/editable-blog/commit/08f4f93219bc2bc7dea23fed624e9e988646b575))
* Implement language toggle in WebsiteNav ([db41679](https://github.com/MohammadBnei/editable-blog/commit/db416797fb1c0cc4000449b940cb25386953f5e6))
* Pass lang parameter to updateArticle function ([0876439](https://github.com/MohammadBnei/editable-blog/commit/08764393354ebf8f756b69d835e4406257c25421))
* Pass language from locals to getArticles function ([4c3a869](https://github.com/MohammadBnei/editable-blog/commit/4c3a869ecea011ef414b7cf44e492116dec55db8))
* Pass language to API functions for localized content ([cad3bd9](https://github.com/MohammadBnei/editable-blog/commit/cad3bd915fbc41b645afcc5a54c6432122e3f772))
* Redefine pages primary key to 'id' and add unique index on (page_id, lang) ([3264fc2](https://github.com/MohammadBnei/editable-blog/commit/3264fc2077c5db03a3faa7630cb023f19f0b06a5))

# [0.2.0](https://github.com/MohammadBnei/editable-blog/compare/0.1.0...0.2.0) (2025-07-24)


### Bug Fixes

* **api.js:** update import statements to use 'env' object for private variables ([ffe39dc](https://github.com/MohammadBnei/editable-blog/commit/ffe39dc3375c5323b87e915fb1567ff1025f70a8))
* Ensure asset cleanup in updateArticle is non-blocking ([70682c0](https://github.com/MohammadBnei/editable-blog/commit/70682c04f173173fefa659d2f3f64c12d8f5c6eb))
* Use dynamic private environment variables ([3ab89ec](https://github.com/MohammadBnei/editable-blog/commit/3ab89ecfb70eea44d24760f2e138c9bd662a1815))


### Features

* Add basic auth to webhook calls ([892521b](https://github.com/MohammadBnei/editable-blog/commit/892521bf0475eb113c20b5c3f6a3c361c6a95f10))
* Add N8N_USERNAME and N8N_PASSWORD to environment variables ([b8df9d0](https://github.com/MohammadBnei/editable-blog/commit/b8df9d07ffffe4f161cf35489b849692b7a368f2))
* Delete associated assets when deleting an article ([d266326](https://github.com/MohammadBnei/editable-blog/commit/d266326e17ca062fcf21ace1982ff0887acbc40c))
* Implement asset cleanup on article update and refactor deleteArticle ([7374b15](https://github.com/MohammadBnei/editable-blog/commit/7374b158cbf7fa80c520101afc0b6723e34004b1))
* Trigger webhook on article creation ([cb9c1c2](https://github.com/MohammadBnei/editable-blog/commit/cb9c1c218e9adc4100ce3faddf086f2d565155f7))

# [0.1.0](https://github.com/MohammadBnei/editable-blog/compare/0.0.4...0.1.0) (2025-07-23)


### Bug Fixes

* Use `db.query()` for prepared statements and `db.run()` for single executions ([e398217](https://github.com/MohammadBnei/editable-blog/commit/e3982177a2f4672a0f60095760f33588b412ca4a))


### Features

* Add auto-migration and update schema for PostgreSQL compatibility ([b79e44b](https://github.com/MohammadBnei/editable-blog/commit/b79e44b1ccf44750421eeb689a527e4a91dc2dae))
* Add Docker Compose file for PostgreSQL service ([41f7125](https://github.com/MohammadBnei/editable-blog/commit/41f712565b7aebee8e384c4593ff042ed1f484d5))
* Personalize website teaser with name and description ([af51642](https://github.com/MohammadBnei/editable-blog/commit/af5164231fa05d01cef55d5d32d7af157289f909))
* Refine intro steps for humble and engaging tone ([ee230d1](https://github.com/MohammadBnei/editable-blog/commit/ee230d11f7436f843b1ada82f27430766c5ab0f0))

## [0.0.4](https://github.com/MohammadBnei/editable-blog/compare/0.0.3...0.0.4) (2025-07-23)

## [0.0.3](https://github.com/MohammadBnei/editable-blog/compare/0.0.2...0.0.3) (2025-07-23)

## 0.0.2 (2025-07-23)

### Bug Fixes

- Update email constant to mohammad@bnei.dev ([e895f86](https://github.com/MohammadBnei/editable-blog/commit/e895f869fb1baa758c6d602448e500ced2f92e5d))
