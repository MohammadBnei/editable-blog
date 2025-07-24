# Changelog

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
