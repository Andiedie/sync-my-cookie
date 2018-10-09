# Sync My Cookie

[English](https://github.com/Andiedie/sync-my-cookie/blob/master/README.md) | [中文](https://blog.andiedie.cn/2018/04/10/Sync-My-Cookie%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3/)

Sync My Cookie is an extension that syncs cookies between multiple browsers.

For safety issues, read [5. Security](https://github.com/Andiedie/sync-my-cookie/blob/master/README.md#5-security)

# 1. Install

You can download and install this extension directly from [Chrome Web Store](https://chrome.google.com/webstore/detail/syncmycookie/laapobniolmbhnkldepjnebendehhmmf), it needs the following permissions:

- Read and change all your data on the websites you visit
- Display notifications

Source code can be obtained directly from my [GitHub repository](https://github.com/Andiedie/sync-my-cookie).

# 2. Configuration

In order to be able to share cookies between multiple devices, SyncMyCookie encrypts your cookies in [Gist](https://gist.github.com/). So you should have a [GitHub](https://github.com/) account。

## 2.1. Generate GitHub Access Token

GitHub Access Token（**GAT** for short）is used to allow SyncMyCookie to modify your Gist, So **GTA only needs a Gist scope**. Click this [link](https://github.com/settings/tokens/new) to generate a new GAT.

Steps：

1. Description

![](assets/40685073.jpg)

This `description` is insignificant. You can fill in anything you like. But **SyncMyCookie** is recommended to remind you this GAT is being used by this extension.

2. Scopes

![](assets/94211156.jpg)

**SyncMyCookie  only requires Gist scope**, so please do not check other unnecessary permissions to ensure your account security.

3. Generate

![](assets/45349467.jpg)

Click `Generate` button and you will see the newly created GAT.

![](assets/44094273.jpg)

ATTENTION: **You won't be able to see it again**. Please keep it properly, otherwise it can only be regenerated.

## 2.2. Configure Extension 

![](assets/17362904.jpg)

Right click on SyncMyCookie  and click `Options`.

![](assets/64016825.jpg)

Enter the the newly created GAT into the first line. The second line is the secret key used to encrypt the cookie. You can enter anything you like.

Just ignore the third line and click `Save`.

# 3. Usage

## 3.1. Add Record

Click the SyncMyCookie and click `Push`in the pop-up page.

![](assets/59415464.jpg)

Click `OK`，cookies for **current page** encrypted and uploaded. The newly added record will be inserted into the list.

![](assets/27757234.jpg)

### Replace

Under the same hostname, uploaded cookies will overwrite previous records.

![](assets/1484769.jpg)



## 3.2. Merge Cookies

To use the previously saved cookies, just click on the corresponding item in the list.

![](assets/19342447.jpg)

Click `OK`, and previously saved cookies will be **merged **into browser.

Merging means that cookies with the same name will be overwrite and other cookies will not be affected.

### How to test whether effective

You can clear cookies first: press `F12` on current page, select `Application`, right-click the items in left column, and click `Clear`.

![](assets/82499319.jpg)

After cleaning, refresh the current page and you will find that you have **logged out**.

At this point, use SyncMyCookie to merge the previous records, refresh again, and you will find that **the login status is restored**.

This shows that the merging is effective.

## 3.3. Remove Record

![](assets/35264211.jpg)

Hover over the record you want to delete and click the delete button on the right.

## 3.4. Auto-Merge

Manually merging cookies every time is annoying, so SyncMyCookie provides *Auto-Merge* feature.

**Auto-Merge**: You can set certain records as *Auto-Merge*. Every time you open a new browser window, the extension automatically merges the cookies for these recordes for you.

### Enable

Hover over the record that needs to enable *Auto-Merge* and click the `+` button on the left.

![](assets/10265037.jpg)

Records enabled *Auto-Merge* will show a different color. For example, `github.com` and `www.google.com.hk` in the figure below enable *Auto-Merge*.

![](assets/58473151.jpg)

### Notification

When you open a new browser window, *Auto-Merge* will start up and notify you which records have been merged.

![](assets/62414781.jpg)

## 4. Multi-device Synchronization

To synchronize cookies between multiple devices, you must make SyncMyCookie on different devices use **exactly the same** figuration.

## 4.1. Automatic configuration

If you are using the Chrome browser and you have already logged in your Google account, Chrome on your devices will automatically sync the configuration (but will not synchronize the *Auto-Merge* setting). So you don't need to configure manually.

## 4.2. Manual configuration

Open SyncMyCookie options page.

![](assets/53699529.jpg)

Copy the configuration of these page completely to the other browser's SyncMyCookie options page.

This allows you to synchronize cookies across multiple browsers.

# 5. Security

Since cookie is your extremely important security certificate, please use this extension very carefully.

SyncMyCookie guarantees that your cookies are safe during transmission and storage, but you still need to pay attention to the following points.

## 5.1. Configure Security

SyncMyCookie does not **share** your cookies with everyone, but it synchronizes with devices that use **the same configuration**.

Therefore, to ensure the safety of your cookies, please do not disclose your configuration.

## 5.2. GAT Security

SyncMyCookie guarantees that only Gist scope of GAT will be used. However, to prevent potential security issues, please give Gist permission only when generating GAT.

## 5.3. Potential Risks

In theory, multiple devices using the same cookie can achieve simultaneous use of some services, but this is related to the service provider's detection mechanism.

Therefore, using this extension for account sharing, the risk is **uncertain**.
