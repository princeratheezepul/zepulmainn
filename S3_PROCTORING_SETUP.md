# AWS S3 Setup for Proctoring Snapshots

This guide walks you (step by step, no prior AWS experience assumed) through creating the
S3 storage that holds the webcam snapshots captured during coding tests and AI interviews.
Recruiters view these snapshots to confirm the same real person took the test and the
interview.

**What the app does with S3:** during a proctored session the candidate's browser sends a
small webcam JPEG to *our* server every ~30 seconds. Our server uploads it to your **private**
S3 bucket and stores only the object's key in MongoDB. When a recruiter opens the results, our
server generates a short-lived **presigned URL** so the image loads in their browser. The images
are never public.

You only need to do this **once**. Total time: ~10 minutes.

---

## What you'll end up with (4 values)

At the end you'll paste these into the server environment:

| Variable | Example | What it is |
|---|---|---|
| `AWS_REGION` | `ap-south-1` | The region your bucket lives in |
| `AWS_S3_BUCKET` | `zepul-proctoring-images` | Your bucket name |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | The app user's key id |
| `AWS_SECRET_ACCESS_KEY` | `wJalr...` | The app user's secret (shown once) |

---

## Step 1 — Create an AWS account

If you don't have one, go to <https://aws.amazon.com/> → **Create an AWS Account**. You'll need a
credit card, but this feature costs pennies and the free tier covers 5 GB of S3 for the first 12
months (see the cost note at the bottom).

---

## Step 2 — Create the S3 bucket (private)

1. Sign in to the **AWS Management Console**.
2. In the top search bar, type **S3** and open the **S3** service.
3. Click **Create bucket**.
4. **Bucket name:** enter a globally-unique name with **no dots**, e.g. `zepul-proctoring-images`.
   (Dots can break the secure image URLs — use only lowercase letters, numbers, and hyphens.)
5. **AWS Region:** pick one close to your users, e.g. **Asia Pacific (Mumbai) `ap-south-1`** or
   **US East (N. Virginia) `us-east-1`**. **Write down the region code** — it's your `AWS_REGION`.
6. **Block Public Access settings:** leave **"Block all public access" turned ON** (this is the
   default). The images stay private; recruiters see them through temporary signed links.
7. Leave everything else as default and click **Create bucket**.

Your bucket name is your `AWS_S3_BUCKET`.

---

## Step 3 — Create a permissions policy

This limits the app to only reading/writing *your* bucket — nothing else in your account.

1. In the top search bar, open the **IAM** service.
2. In the left menu, click **Policies** → **Create policy**.
3. Click the **JSON** tab and paste the following, replacing **`YOUR_BUCKET_NAME`** with the bucket
   name from Step 2 (keep the `/*` at the end):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "ProctoringBucketReadWrite",
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject"],
         "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
       }
     ]
   }
   ```

4. Click **Next**, give it a name like `zepul-proctoring-policy`, and click **Create policy**.

---

## Step 4 — Create the app user + access key

1. Still in **IAM**, click **Users** → **Create user**.
2. **User name:** e.g. `zepul-s3-uploader`.
3. Do **NOT** check "Provide user access to the AWS Management Console" — the app only needs
   programmatic access.
4. Click **Next**. On the permissions page choose **Attach policies directly**, search for
   `zepul-proctoring-policy` (from Step 3), check it, and click **Next** → **Create user**.
5. Open the new user → **Security credentials** tab → **Create access key**.
6. Choose **Application running outside AWS** → **Next** → **Create access key**.
7. Copy both values now:
   - **Access key ID** → this is `AWS_ACCESS_KEY_ID`
   - **Secret access key** → this is `AWS_SECRET_ACCESS_KEY` (**shown only once** — copy it before
     leaving the page; if you lose it, just create a new access key).

---

## Step 5 — Add the values to the server

### Local development
Open `server/.env` and fill in the four `AWS_*` values (placeholders are already there):

```
AWS_REGION=ap-south-1
AWS_S3_BUCKET=zepul-proctoring-images
AWS_ACCESS_KEY_ID=AKIA...your-key...
AWS_SECRET_ACCESS_KEY=...your-secret...
```

Restart the server (`npm run dev` in `server/`).

### Production (Render)
The backend runs on Render. Open your backend service → **Environment** → add the same four
variables → **Save**. Render will redeploy. (Never commit real keys to git — `server/.env` is
already gitignored.)

---

## Step 6 — Verify it works

1. As a recruiter, schedule a coding assessment for a test candidate and open the assessment link
   (`/assessment/<id>`). The page will ask for camera permission — click **Allow**.
2. Let it run ~1 minute, then check the **S3 console** → your bucket → you should see objects
   appearing under `proctoring/assessments/...`.
3. Do the same for an AI interview (`/meeting/<token>`); objects appear under
   `proctoring/interviews/...`.
4. Open the candidate's result in the recruiter dashboard — the **Proctoring Snapshots** gallery
   shows the captured images.

> Until these 4 values are set, the app still works normally — candidates just complete their
> sessions and no images are stored (uploads are silently skipped). Camera permission is still
> requested. Nothing breaks.

---

## Cost

Webcam frames are tiny (tens of KB). A few thousand of them per month is a few **cents**. The AWS
Free Tier includes 5 GB of S3 storage, 20,000 GET and 2,000 PUT requests per month for the first
12 months, which comfortably covers normal usage. You can set a billing alert in **Billing →
Budgets** if you want peace of mind.

---

## Security notes

- The bucket is **private** ("Block all public access" ON). Images are never directly reachable by
  URL — recruiters load them through short-lived signed links minted by our authenticated API.
- The IAM user can only `PutObject`/`GetObject` on this one bucket — it cannot delete objects,
  touch other buckets, or do anything else in your account.
- If a key is ever leaked, delete it in **IAM → Users → Security credentials** and create a new one.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| No objects appear in S3 | Check the 4 env vars are set and the server was restarted. Check the server logs for `S3 is not configured` or an AWS error. |
| Recruiter gallery is empty | The candidate may have taken the session before AWS was configured, or blocked their camera (you'll see a "Camera blocked by candidate" badge). |
| `AccessDenied` in server logs | The IAM policy `Resource` must be `arn:aws:s3:::YOUR_BUCKET_NAME/*` and the policy must be attached to the user. |
| `PermanentRedirect` / region errors | `AWS_REGION` must match the region you created the bucket in. |
