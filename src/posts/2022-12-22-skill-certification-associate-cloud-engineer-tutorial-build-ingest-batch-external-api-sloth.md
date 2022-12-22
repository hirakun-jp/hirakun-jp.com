---
title: "【Google Cloud】 GCE でデータ収集処理基盤を構築する方法"
description: "GCE を使ってデータ収集処理基盤を構築する手順をご紹介します。"
date: 2022-12-22
thumb: "2022-12-22-batch-sloth-diagram.drawio.png"
tags: 
    - 勉強
    - "Associate Cloud Engineer"
    - Google Cloud
    - GCE
---

この記事では、Compute Engine（GCE） を使ってデータ収集処理基盤を構築する方法をご紹介します。

以下の要件を満たすデータ収集処理基盤が必要な場合、この記事が参考になれば幸いです。

- バッチ処理であり、1 日 1 回実行できればよい。
- 処理に 1 時間以上かかる。
- 外部 API を叩く、または、Web スクレイピングする必要がある。
- 既存のデータパイプラインは存在しない。

データ収集のバッチ処理が 1 時間以内で終わる場合は、Cloud Functions（第 2 世代）および Cloud Scheduler の使用を検討してください。[1]

他のクラウドストレージプロバイダからのデータ転送には、Storage Transfer Service、データベースから Cloud Storage へのストリーミング処理には、変更データキャプチャサービスである Datastream を使用してください。[2][3]

また、Composer（Airflow）、Dataflow を使用したデータパイプラインが既に存在する場合は、その中にデータ収集処理を組み込んでください。

<!--
## 費用
このデータ収集処理基盤では、以下のサービスを使用します。
Compute Engine で使用するインスタンスのスペック・起動時間と、Cloud Storage のバケットへ保存するファイル数に応じて費用が異なってきます。
いずれラベルつけて料金計算しやすくする
-->

## システム構成

データレイクとして Cloud Storage のバケット、データ収集処理基盤として Compute Engine のインスタンスを使用します。
Compute Engine のインスタンススケジュールを設定することで、日次でバッチ処理が走るようにします。

![diagram](/assets/img/2022-12-22-batch-sloth-diagram.drawio.png) 


## 構築手順

以下のステップで構築していきます。

1. 構築環境を準備する
1. ストレージを実装する
1. データ収集処理を実装する
1. ネットワークを作成する
1. データ収集処理基盤を構築する

## Step 1: 構築環境を準備する

構築環境を準備するため、Google Cloud プロジェクトにおいて以下のタスクを実行します。

1. 作業者に必要なロールを付与・使用するサービスの Google API を有効化する。

    この記事では、個人アカウントでの作業を想定しているため、ロールの付与は必要ありません。
    Google API についても、求められたら有効化する対応を取ることとします。

1. Cloud Shell のターミナルで、以下のコマンドを実行して、 GitHub リポジトリからクローンする。

    ```sh
    git clone https://github.com/hirakun-jp/data-engineering-practice.git
    ```

1. Cloud Shell のターミナルで、以下のコマンドを実行して、 環境変数を設定する。

    ```sh
    cd data-engineering-practice/ingest-batch-external-api-sloth/
    source set_env.sh
    ```

    環境変数の命名規則について、VPC ネットワークに関するものはこちら[4]、リージョンに関するものはこちら[5]を参考にしました。

## Step 2: ストレージを実装する

収集したデータを格納するため、 Cloud Storage でバケットを作成します。

1. Cloud Shell のターミナルで、以下のコマンドを実行します。

    ```
    gsutil mb -c standard -b on -l "${RESULT_BUCKET_REGION}" "gs://${RESULT_BUCKET_TEST}"
    ```

    gsutil アプリケーションの `mb` コマンドを実行することでバケットの作成を行い、各オプションでバケットの詳細を指定しています:

    - **c**: ストレージのクラスを指定します。バケットは頻繁にアクセスするものと仮定して **standard** クラスを指定しています。
    - **b**: アクセス制御方法を指定します。均一 と きめ細かい管理 の 2 種類ありますが、Google Cloud 推奨の **均一** を指定しています。[6]
    - **l**: バケットを作成するロケーションを指定します。standard クラスで作成するため、この後のステップで作成する **Compute Engine インスタンスと同じリージョン** へ配置することでネットワーク料金を削減します。[7]

    `mb` コマンドの詳細については、巻末の参考文献を確認してください。[8]

## Step 3: データ収集処理を実装する

今回は簡単に、処理の開始時刻をファイル名に持つファイルを作成し、バケットに保存する処理をシェルスクリプト`startup-script.sh`で記述しています。

このスクリプトはこの後のステップで作成する Compute Engine インスタンス上で実行されるため、Cloud SDK に含まれる CLI アプリケーション（gcloud, gsutil 等）がデフォルトで使用できます。

1. Cloud Shell のエディタで、`startup-script.sh`を開いて中身を確認します。

    ```sh
    #!/bin/bash

    today=`date "+%Y%m%d-%H%M%S"`
    touch helloworld-${today}.txt
    gsutil cp helloworld-${today}.txt "gs://ingest-batch-ext-api-sloth-result-test-gcs"
    rm helloworld-${today}.txt
    ```

    このファイルの中身を自身が記述したプログラムを呼び出す処理に置き換えてください。

## Step 4: ネットワークを作成する

ネットワークを作成するため、以下のタスクを実行します。

1. Cloud Shell のターミナルで、以下のコマンドを実行して、**VPC ネットワーク**を作成します。

    ```sh
    # create the network
    gcloud compute networks create ${NETWORK_NAME_TEST} \
    --subnet-mode=custom
    ```

    今回、各リージョンにサブネットを作成する必要はないため、カスタムモードで VPC ネットワークを作成しています。[9]

1. Cloud Shell のターミナルで、以下のコマンドを実行して、**サブネット**を作成します。

    ```sh
    # create the subnetwork
    gcloud compute networks subnets create ${SUBNET_NAME_TEST} \
        --network=${NETWORK_NAME_TEST} \
        --region=${SUBNET_REGION} \
        --range=172.16.0.0/24 \
        --enable-private-ip-google-access
    ```

    gcloud アプリケーションの `compute networks subnets create` コマンドにオプションを指定してサブネットを作成しています:

    - **network**: サブネットをどの VPC ネットワークに作成するかを指定します。
    - **region**: サブネットを作成するリージョンを指定します。この後のステップで作成する Compute Engine インスタンスのリージョンを指定しています。
    - **range**: サブネットの IPv4 アドレス範囲を CIDR 表記で指定します。有効な範囲を指定しています。[10]
    - **enable-private-ip-google-access**: 限定公開の Google アクセスを構成します。このオプションは不要です。[11]

    続けて以下のコマンドを実行して、限定公開の Google アクセスが有効化されたことを確認します。

    ```sh
    gcloud compute networks subnets describe ${SUBNET_NAME_TEST} \
        --region=${SUBNET_REGION} \
        --format="get(privateIpGoogleAccess)"
    ```

1. Cloud Shell のターミナルで、以下のコマンドを実行して、上りの**ファイアウォールルール**を作成します。

    ```sh
    # create the firewall rules
    gcloud compute firewall-rules create ${IAP_FIREWALL_RULE_NAME} \
        --network=${NETWORK_NAME_TEST} \
        --source-ranges 35.235.240.0/20 \
        --target-tags ${IAP_NETWORK_TAG} \
        --allow tcp:22
    ```
    
    gcloud アプリケーションの `compute firewall-rules create` コマンドにオプションを指定してファイアウォールルールを作成しています。
    各オプションの詳細は、巻末の参考文献を確認してください。[12]

    ここでは、Google Cloud が提供する認証プロキシ Identity-Aware Proxy（IAP）を使用して、この後のステップで作成する Compute Engine インスタンスへのアクセスを制限しています。[13] 
    このファイアウォールルールがあることで、外部 IP アドレスを持たない、つまりインターネット上にさらされていないインスタンスへ、IAP トンネル経由でのアクセスが許可されたユーザーが ssh 接続できるようになります。

    IAP で保護されたトンネルのユーザーを追加するには、巻末の参考文献を確認してください。[14]

1. Cloud Shell のターミナルで、以下のコマンドを実行して、**Cloud Router**を作成、**Cloud NAT ゲートウェイ**を構成します。

    ```sh
    # create the cloud router instance
    gcloud compute routers create ${NAT_ROUTER_NAME_TEST} \
        --network ${ROUTER_NETWORK} \
        --region ${ROUTER_REGION}

    # configure the router
    gcloud compute routers nats create ${NAT_CONFIG_NAME_TEST} \
        --router-region ${ROUTER_REGION} \
        --router ${NAT_ROUTER_NAME_TEST} \
        --nat-all-subnet-ip-ranges \
        --auto-allocate-nat-external-ips
    ```

    gcloud アプリケーションの `gcloud compute routers create` コマンド、`gcloud compute routers nats create` コマンドにオプションを指定して Cloud NAT ゲートウェイを構成しています。
    各オプションの詳細は、巻末の参考文献を確認してください。[15]

    このタスクでは、外部 IP アドレスを持たないインスタンスがインターネットへアクセスできるようにしました。インターネットへアクセスできるということは、パブリックなエンドポイントを持つ Google API へアクセスできるということです。

    外部 IP アドレスを持たないインスタンスは、

    - 限定公開の Google アクセスが有効となっている場合、それを利用して Google API へアクセスします。
    - 限定公開の Google アクセスが有効となっていない場合、Cloud NAT が利用可能ならばそれを利用して Google API へアクセスします。
    - 限定公開の Google アクセス、Cloud NAT の両方が利用できない場合、Google API へアクセスできません。
    
    限定公開の Google アクセス、Cloud NAT の有効／無効による通信経路の詳細は、巻末の参考文献を確認してください。[16]

## Step 5: データ収集処理基盤を構築する

データ収集処理基盤を構築するため、以下のタスクを実行します。

1. Cloud Shell のターミナルで、以下のコマンドを実行して、サービスアカウントを作成・ロールを付与します。

    ```sh
    # create the service account
    gcloud iam service-accounts create ${VM_SERVICE_ACCOUNT_NAME_TEST} \
        --display-name=${VM_SERVICE_ACCOUNT_NAME_TEST}

    # grant the service account an IAM role
    gsutil iam ch "serviceAccount:${VM_SERVICE_ACCOUNT_EMAIL_TEST}:roles/storage.objectAdmin" "gs://${RESULT_BUCKET_TEST}"

    gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
        --member="serviceAccount:${VM_SERVICE_ACCOUNT_EMAIL_TEST}" \
        --role="roles/monitoring.metricWriter"
    ```

    Identity and Access Management（IAM）では、プロジェクトレベルのロールとバケットレベルのロールを付与できます。[17]　

    グループを作成の上、事前定義ロール・カスタムロールをグループに付与して、ユーザーをグループに追加することがアクセス制御の方法としてベストプラクティスとなっていますが、
    ユーザーがサービスアカウントの場合は必要なアクセス権のみを個別に付与することが推奨されます。[18]

    ここでは、 **ストレージオブジェクト管理者** ロールをサービスアカウントに付与しました。
    これは特定のバケット内のオブジェクトを操作出来るロールであり、バケットの作成・削除はできません。[19]

    また、この後のステップで作成する Compute Engine インスタンスのリソースモニタリングで必要となるロールも付与しています。[20]

1. **Google Cloud > ナビゲーションメニュー > IAM と管理 > IAM** から、**Google 提供のロールを含める** にチェックを入れて表示される Compute Engine サービスエージェントに **Compute インスタンス管理者（v1）** ロールを付与します。
    ![IAM](/assets/img/2022-12-22-121603.png) 
    
    このサービスアカウントは Google が管理するものです。[21] 次のタスクで必要となる権限をあらかじめ付与します。

1. Cloud Shell のターミナルで、以下のコマンドを実行して、インスタンススケジュールを作成します。

    ```sh
    # create the instance schedule
    gcloud compute resource-policies create instance-schedule ${VM_SCHEDULE_NAME_TEST} \
        --vm-start-schedule="${VM_SCHEDULE_START_OPERATION}" \
        --vm-stop-schedule="${VM_SCHEDULE_STOP_OERATION}" \
        --region=${VM_SCHEDULE_REGION} \
        --timezone=${VM_SCHEDULE_TIME_ZONE}
    ```

    この後のステップで作成する Compute Engine インスタンスをいつ起動して／いつ終了するかのスケジュールを設定ています。コマンドの詳細については巻末参考文献を確認してください。[22]      

1. Cloud Shell のターミナルで、以下のコマンドを実行して、Compute Engine インスタンスを作成します。

    ```sh
    # create the instance
    gcloud compute instances create ${VM_NAME_TEST} \
        --machine-type=e2-micro \
        --provisioning-model=STANDARD \
        --service-account=${VM_SERVICE_ACCOUNT_EMAIL_TEST} \
        --scopes https://www.googleapis.com/auth/cloud-platform \
        --network ${VM_NETWORK} \
        --subnet ${VM_SUBNET} \
        --zone ${VM_ZONE_ID} \
        --tags ${IAP_NETWORK_TAG} \
        --no-address \
        --resource-policies=${VM_SCHEDULE_NAME_TEST} \
        --metadata-from-file=startup-script=startup-script.sh
    ```

    今回、インスタンスから Cloud Storage へファイルを転送するため、Google API へのアクセスが必要となります。インスタンスから Google API を操作するときのベストプラクティスについては巻末参考文献を確認してください。[23]

1. Cloud Shell のターミナルで、以下のコマンドを実行して、Compute Engine インスタンスの初期設定をします。

    ```sh
    # ssh
    gcloud compute ssh ${VM_NAME_TEST} --zone ${VM_ZONE_ID} --tunnel-through-iap

    # install or update needed software
    sudo apt-get update
    sudo apt-get install -y python3 python3-venv python3-pip

    # change timezone
    sudo timedatectl set-timezone Asia/Tokyo

    # instal the agent
    curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
    sudo bash add-google-cloud-ops-agent-repo.sh --also-install
    ```

    IAP トンネルを通してインスタンスへ接続して、OSのアップデートやリソースモニタリングのエージェントをインストールしています。[24]

## クリーンアップ

Cloud Shell のターミナルで、以下のコマンドを実行することで各ステップで作成したリソースを削除できます。

```sh
cd data-engineering-practice/ingest-batch-external-api-sloth/
chmod +x delete_all_test.sh
./delete_all_test.sh
```

## 参考資料

1. [Google Cloud. Cloud Functions バージョンの比較-比較表.（参照 2022-12-20）](https://cloud.google.com/functions/docs/concepts/version-comparison?hl=ja#comparison-table)
2. [Google Cloud. Storage Transfer Service とは.（参照 2022-12-21）](https://cloud.google.com/storage-transfer/docs/overview?hl=ja)
3. [Google Cloud. Datastream の概要.（参照 2022-12-21）](https://cloud.google.com/datastream/docs/overview?hl=ja)
4. [Google Cloud. VPC 設計のためのおすすめの方法とリファレンス アーキテクチャ.（参照 2022-12-21）](https://cloud.google.com/architecture/best-practices-vpc-design?hl=ja)
5. [Jay Kim. Alterantive naming schemes for GCP reginons.（参照 2022-12-21）](https://gist.github.com/rpkim/084046e02fd8c452ba6ddef3a61d5d59)
6. [Google Cloud. アクセス制御の概要-推奨されるバケット アーキテクチャ.（参照 2022-12-21）](https://cloud.google.com/storage/docs/access-control?hl=ja#recommended_bucket_architecture)
7. [Google Cloud. ストレージ クラス-Standard ストレージ.（参照 2022-12-21）](https://cloud.google.com/storage/docs/storage-classes?hl=ja#standard)
8. [Google Cloud. mb - Make buckets.（参照 2022-12-21）](https://cloud.google.com/storage/docs/gsutil/commands/mb?hl=ja)
9. [Google Cloud. VPC ネットワーク-サブネット作成モード.（参照 2022-12-21）](https://cloud.google.com/vpc/docs/vpc?hl=ja#subnet-ranges)
10. [Google Cloud. サブネット-有効な IPv4 範囲.（参照 2022-12-21）](https://cloud.google.com/vpc/docs/subnets?hl=ja#valid-ranges)
11. [Google Cloud. 限定公開の Google アクセス.（参照 2022-12-21）](https://cloud.google.com/vpc/docs/private-google-access?hl=ja)
12. [Google Cloud. VPC ファイアウォール ルールを使用する-ファイアウォール ルールを作成する.（参照 2022-12-21）](https://cloud.google.com/vpc/docs/using-firewalls?hl=ja#creating_firewall_rules)
13. [Google Cloud. Identity-Aware Proxy の概要.（参照 2022-12-21）](https://cloud.google.com/iap/docs/concepts-overview?hl=ja)
14. [Google Cloud. プライベート VM のインターネット接続の構築-追加のユーザーにアクセスを許可する.（参照 2022-12-21）](https://cloud.google.com/architecture/building-internet-connectivity-for-private-vms?hl=ja#grant_access_to_additional_users)
15. [Google Cloud. Compute Engine で Cloud NAT を設定する-手順 6: Cloud Router を使用して NAT 構成を作成する.（参照 2022-12-21）](https://cloud.google.com/nat/docs/gce-example?hl=ja#create-nat)
16. [遠山雄二ほか.「VPCリソースとパブリックなサービスとの通信経路」.『エンタープライズのためのGoogle Cloud』. 翔泳社, 2022, p. 118](https://www.amazon.co.jp/%E3%82%A8%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%97%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AEGoogle-Cloud-%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%89%E3%82%92%E6%B4%BB%E7%94%A8%E3%81%97%E3%81%9F%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%81%AE%E6%A7%8B%E7%AF%89%E3%81%A8%E9%81%8B%E7%94%A8-%E9%81%A0%E5%B1%B1-%E9%9B%84%E4%BA%8C/dp/4798174181)
17. [Google Cloud. Identity and Access Management-プロジェクト レベルのロールとバケットレベルのロール.（参照 2022-12-22）](https://cloud.google.com/storage/docs/access-control/iam?hl=ja#project-level_roles_vs_bucket-level_roles)
18. [Google Cloud. サービス アカウントを操作するためのベスト プラクティス-サービス アカウントにリソースへのアクセス権を付与する際にグループを使用しないようにする.（参照 2022-12-22）](https://cloud.google.com/iam/docs/best-practices-service-accounts?hl=ja#groups)
19. [Google Cloud. IAM 権限の使用-バケットレベルのポリシーにプリンシパルを追加する.（参照 2022-12-22）](https://cloud.google.com/storage/docs/access-control/using-iam-permissions?hl=ja#bucket-add)
20. [Google Cloud. IAM によるアクセス制御-事前定義された役割.（参照 2022-12-22）](https://cloud.google.com/monitoring/access-control?hl=ja#predefined_roles)
21. [Google Cloud. サービス アカウント-Compute Engine サービス エージェント. （参照 2022-12-22）](https://cloud.google.com/compute/docs/access/service-accounts#compute_engine_service_account)
22. [Google Cloud. VM インスタンスの起動と停止をスケジュールする-インスタンス スケジュールを管理する.（参照 2022-12-22）](https://cloud.google.com/compute/docs/instances/schedule-instance-start-stop#managing_instance_schedules)
23. [Google Cloud. サービス アカウントを使用したワークロードを認証-ベスト プラクティス.（参照 2022-12-22）](https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances?hl=ja#best_practices)
24. [Google Cloud. 個々の VM に Ops エージェントをインストールする-最新バージョンのエージェントをインストールする.（参照 2022-12-22）](https://cloud.google.com/stackdriver/docs/solutions/agents/ops-agent/installation?hl=ja#install-latest-version)