---
title: Ukubi STT
description: GPU speech-to-text as a single Rust binary, on the one card in my flat — about half a second behind the speaker, and refusing to start if the GPU is not actually doing the work.
date: 2026-09-02
stack: [Rust, gRPC, ONNX Runtime, CUDA, Kubernetes]
gitLink: 'https://github.com/MohammadBnei/ukubi-stt'
writeup: /blog/realtime-speech-to-text-in-rust
---

One Rust binary with one gRPC method. It takes raw 16 kHz audio and returns
text roughly 560 ms behind the speaker, on an RTX 2070 SUPER pinned to one node
of my self-hosted cluster. Two of my own applications use it: `dream-analyst`,
where you dictate a dream instead of typing it, and the `agent-fleet` console,
where I dictate prompts at agents. Empty repository to serving both in three
days.

## The first thing I wrote was not the service

It was an assertion. `parakeet-rs` registers the ONNX Runtime CUDA provider
with the CPU provider behind it — so if CUDA fails to initialise, the model
still loads, still transcribes, and returns entirely correct text, with nothing
in the logs that reads as an error. So the binary
reads GPU memory before loading the model and after a warmup decode, and
crashes on boot if the number did not move.

It fired on the first real run. `nvidia-smi` answered from inside the
container, the transcripts were right, every indicator was green, and it was
decoding on the CPU. I would have shipped it that way.

That is the failure the whole design is pointed at: not a crash, but the run
that returns the right answer, in the right shape, by the wrong route. It is
also why `decode_seconds` is in the wire format rather than a server log line —
the number that reveals the failure belongs to every caller.

## Three models, one card

Batch multilingual, streaming, and a Persian CTC model that turned out not to
need the GPU at all and runs on CPU. The card is shared with my games, so the
service is one replica, no HA, and the node reboots when I want to play
something. Both consumers treat an unavailable transcriber as a disabled
feature rather than an outage. There is no public endpoint: it answers
in-cluster, to callers holding their own token.
