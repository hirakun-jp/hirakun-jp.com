---
title: Associate Cloud Engineer 認定試験に合格するまでにやったこと
description: 2023 年 1 月 7 日実施の Associate Cloud Engineer 認定資格試験に合格したので、勉強方法をご紹介します。
date: 2023-01-19
thumb: 
tags: 
    - 勉強
    - Associate Cloud Engineer
    - Google Cloud
---

2023 年 1 月 7 日実施の Associate Cloud Engineer 認定資格試験に合格したので、勉強方法をご紹介します。

勉強開始時点での自分の状態はこんな感じです。

- IT知識: おそらく基本情報技術者試験に合格できる程度。資格は持っていません。
- GCP歴: 6ヵ月。主に Compute Engine、Cloud Functions、Cloud Storage、BigQuery を触っていました。
- 英語: 高校までで習う範囲程度の知識。

毎週 10 時間、1 ヵ月半ほど勉強しました。なので総時間は 60 時間ほどです。試験は 50 問中、40 問自信あり、5 問自信なし、5 問分からない、といった感触でした。

## おすすめの勉強方法

おすすめの勉強方法は以下のとおりです。

1. 模擬試験を受ける
1. Cloud Engineer の学習プログラムのコースを一通り受講する
1. Google Cloud のサービスを使ってシステムを実際に作ってみる
1. Cloud Engineer の学習プログラムの問診 PDF を再度一通り解く
1. 模擬試験を再度受ける

## Step 1: 模擬試験を受ける

[Associate Cloud Engineer 試験の概要](https://cloud.google.com/certification/cloud-engineer?hl=ja)のステップ 4 にある模擬試験を受けて、どんな問題がどんな形式で出題されるのかを初めに確認します。

## Step 2: Cloud Engineer の学習プログラムの動画を一通り観る

[Associate Cloud Engineer 試験の概要](https://cloud.google.com/certification/cloud-engineer?hl=ja)のステップ 3 にある学習プログラムに沿って学習を進めます。

学習プログラムには以下の 3 種類が用意されていますが、このうちコースだけをすべて受講します。

- コース（Course）: ビデオとクイズで学習するもの
- ラボ（Lab）: Hands-on 形式で Google Cloud サービスを操作して学習するもの
- クエスト（Quest）：ラボの集まり

学習プログラムはところどころ（というよりほぼ）英語なので、英語が読める・聞けることが望ましいです。

## Step 3: Google Cloud のサービスを使ってシステムを実際に作ってみる

コースをすべて受講したら、次は実際に Google Cloud にプロジェクトを作成して、各サービスを触ってみます。

Compute Engineを使って、何かしらシステムを作ってみることをお勧めします。コースの学習を完了すると分かると思いますが、Compute Engine は Google Cloud のコンピューティングサービスのベースとなるもので、これを理解することが重要に思います。

私はデータ収集処理の基盤構築という題材でシステムを構築してみました。

## Step 4: Cloud Engineer の学習プログラムの問診 PDF を再度一通り解く

Cloud Engineer の学習プログラムの初回コース「Preparing for Your Associate Cloud Engineer Journey」にある、「Study plan resources」を一通り読みます。

その中に、問診「Diagnostic Question」があるのでこれを解きます。解いて分からない場合や間違った場合は、解答と参考リンク先をよく読んで理解します。

## Step 5: 模擬試験を再度受ける

再度、模擬試験を受けてみて、90 % ほど解答できることを確認してから試験に臨みました。

## 試験当日に意識すべきこと

Associate Cloud Engineer 試験では、以下のことを行う能力が評価されます。

- クラウド ソリューション環境の設定
- クラウド ソリューションの計画と構成
- クラウド ソリューションのデプロイと実装
- クラウド ソリューションの正常なオペレーションの確保
- アクセスとセキュリティの構成

Cloud SDK の CLI ツールのコマンドのオプションを詳細に答えられる必要はありません。架空ではありますが、実際にありそうな例に沿った問題に対して、解決策は何かを考える力が問われます。なので、Google Cloud のどのサービスのどんな特徴が解決策として合致するかを判断するために、問題文をよく読みましょう。また「最小の労力で」「もっともコストを低く」「Google が推奨する」等の文脈に注意しましょう。