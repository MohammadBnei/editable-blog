---
title: Twelve times faster than realtime, and the GPU was doing none of it
description: Leads with the Gate 0 failure, argues for assertions over dashboards, ends on the post. One idea only — no tour of the service.
date: 2026-09-02
source: /blog/realtime-speech-to-text-in-rust
---

Twelve times faster than speech. Correct transcripts. Every log line green.

The GPU was doing none of it.

I spent three days building a realtime speech-to-text service in Rust — one binary, one gRPC method, text landing about half a second behind the speaker, running on a GPU in my flat. The first thing I wrote was not the service. It was a function that reads GPU memory, loads the model, reads it again, and refuses to start if the number did not move.

That felt like paranoia until the first run on real hardware, when it failed.

The library I depend on registers its CUDA provider with the failure check on the _CPU_ fallback instead. So when CUDA does not initialise, ONNX Runtime quietly drops to CPU and everything still works — correct text, roughly thirty times slower, nothing in the logs that reads as an error. `nvidia-smi` answered from inside the container. The device plugin was fine. The transcripts were right.

Two bugs, both in my Dockerfile, and I would have shipped past both of them.

The lesson I keep coming back to: crashes are the easy failure. Something goes red and you go and look. The expensive one is the run that returns the right answer, in the right shape, with every indicator green, by the wrong route. No dashboard shows you that, because from the outside it is indistinguishable from success.

So the service asserts on itself instead. It crashes on boot rather than degrading. It puts the decode time in the wire format, where every caller can check it, instead of in a log nobody reads. It rejects a wrong sample rate rather than resampling it into a plausible-looking transcript.

Written up properly, including the part where a hand-written filterbank taught me that copying a sensible default cost a character error rate of 1.000 with empty output:

https://blog.bnei.dev/blog/realtime-speech-to-text-in-rust
