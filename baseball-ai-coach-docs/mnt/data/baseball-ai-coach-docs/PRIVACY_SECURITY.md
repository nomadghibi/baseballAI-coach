# Privacy and Security — BaseballAI Coach MVP

## 1. Product context
The product stores videos of youth athletes. This requires a privacy-first design from day one.

## 2. MVP privacy principles

1. Parent/guardian controls the account.
2. Videos are private by default.
3. No public sharing in MVP.
4. No social feed.
5. No athlete discovery/search.
6. No face identification or recognition in MVP.
7. Delete must be available.
8. Use the minimum personal data needed.
9. Avoid full date of birth; use birth year or age range.
10. Do not use uploaded videos for model training unless explicit consent exists later.

## 3. Data collected in MVP

### Parent account
- Email
- Password hash
- Optional name

### Athlete profile
- First name or nickname
- Birth year or age group
- Height/weight optional
- Throwing hand
- Position

### Video data
- Uploaded pitching video
- Video metadata
- Extracted pose/keypoints
- Mechanics metrics
- Feedback notes

## 4. Sensitive data decisions

### Avoid in MVP
- Full date of birth
- Public athlete profile
- School name
- Home address
- Face recognition
- Team roster import
- Public comments
- Social sharing

## 5. Access control rules

Every backend query must enforce:

```txt
current_user.id == resource.owner_user_id
```

For athlete resources:

```txt
current_user.id == athlete.owner_user_id
```

For session/video/analysis:

```txt
current_user owns parent athlete/session/video
```

## 6. Storage rules

- Store videos in private buckets only.
- Use signed URLs for upload/playback.
- Signed URLs expire quickly.
- Never expose permanent public video URLs.
- Do not log signed URLs.
- Sanitize file names.

## 7. Authentication

MVP options:
- JWT in secure HTTP-only cookie
- Password hashing using bcrypt or argon2
- HTTPS required in production

Minimum password requirements:
- At least 8 characters
- Rate limit login attempts

## 8. Delete workflow

When user deletes a session/video:

1. Verify ownership.
2. Delete video object from storage.
3. Delete or soft-delete DB video row.
4. Delete analysis result/keypoint data.
5. Delete notes attached to session if deleting session.
6. Return success.

## 9. Security checklist

- [ ] CORS locked to frontend domain
- [ ] HTTPS in production
- [ ] Secure cookies in production
- [ ] Passwords hashed, never stored plain
- [ ] Input validation using Pydantic/Zod
- [ ] File type validation
- [ ] Upload size limit
- [ ] Signed URL expiration
- [ ] Ownership check on every endpoint
- [ ] No raw stack traces to users
- [ ] Environment variables not committed
- [ ] No secret keys in frontend
- [ ] Basic audit logs for delete actions later

## 10. Disclaimers

Add product disclaimer:

```txt
BaseballAI Coach provides general training feedback based on video analysis. It is not medical advice, injury diagnosis, professional coaching certification, or a guarantee of athletic performance. For pain, injury, or medical concerns, consult a qualified professional.
```

For minors:

```txt
This app is intended for use by parents, guardians, or authorized coaches. Do not upload videos without proper permission.
```

## 11. Future compliance considerations

If this becomes commercial and handles children’s data at scale, consult legal counsel regarding:
- COPPA in the United States
- State privacy laws
- Consent requirements
- Data retention policies
- Model training consent

## 12. MVP policy stance

For MVP/family prototype:
- Keep it private.
- Do not market to schools or teams until privacy and consent flows are stronger.
- Do not add sharing until account permissions are mature.
