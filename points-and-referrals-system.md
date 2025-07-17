# Multisynq Points and Referrals System

## Overview

This document outlines the Multisynq platform's points and referrals system, including how points are allocated, the different signup phases, and the mechanics of the referral system.

> **⚠️ VERIFICATION NEEDED**: This documentation is based on Slack thread context and needs to be verified against the actual implementation in the codebase.

## Signup Phases and Point Allocation

### Signup Phases

The Multisynq platform operates in different phases that affect point allocation:

| Phase | Description | Status |
|-------|-------------|---------|
| **Announcement Phase** | Early announcement period | TBD |
| **Pilot Phase** | Limited pilot testing | TBD |
| **Launch Phase** | Current public launch | Active |

> **🔍 TODO**: Verify the actual phase names, descriptions, and current status from the implementation.

### Points Allocation Table

> **⚠️ NEEDS VERIFICATION**: The following table structure is based on Slack thread mentions and needs to be populated with actual values from the implementation.

| Signup Phase | Base Signup Points | Signup Multiplier | Referrer Points | Referred User Points | Notes |
|--------------|-------------------|------------------|-----------------|---------------------|--------|
| Announcement | TBD | TBD | TBD | TBD | Early adopter bonus |
| Pilot | TBD | TBD | TBD | TBD | Beta testing phase |
| Launch | TBD | TBD | TBD | TBD | Current phase |

### Point Allocation Logic

Based on the Slack discussion, the system appears to work as follows:

1. **Regular Signup Points**: Users receive base points upon completing onboarding
2. **Phase Multipliers**: Points are multiplied based on the current signup phase
3. **Referral Points**: 
   - **Referrer**: Receives points multiplied by their signup phase multiplier
   - **Referred User**: Receives a fixed amount regardless of phase

> **🔍 TODO**: Verify the actual point allocation logic from `PointAllocationService` in the codebase.

## Referral System Mechanics

### How Referrals Work

1. **Referral Code Generation**: Each user receives a unique referral code
2. **Sharing Method**: Click-to-copy link that users can share with recipients
3. **Dashboard Display**: Referral code is presented on the website dashboard
4. **Point Assignment**: Points are awarded when both conditions are met:
   - User completes the onboarding process
   - Referral link was used for signup

### Current Issues (January 2025)

Based on recent observations:

- **No referrals since January 9th**: System may not be functioning properly
- **Lack of dashboard explanation**: Users don't understand how the referral system works
- **Missing referral tracking**: Need to investigate referral attribution

## Technical Implementation

### Key Components

> **🔍 TODO**: Verify these component names and locations in the actual codebase.

- **`PointAllocationService`**: Handles point calculation and assignment
- **`Referral` model**: Manages referral relationships and tracking
- **Referral code system**: Generates and validates referral codes
- **Security features**: Prevents referral fraud and gaming

### Database Schema

> **🔍 TODO**: Document the actual database schema for points and referrals.

```sql
-- Example schema structure (needs verification)
-- users table: user_id, signup_phase, total_points, referral_code
-- referrals table: referrer_id, referred_user_id, points_awarded, created_at
-- point_transactions table: user_id, transaction_type, points, phase_multiplier, created_at
```

## Recommendations

### Debugging Steps

1. **Check referral tracking**: Investigate why no referrals since January 9th
2. **Verify point allocation**: Ensure `PointAllocationService` is functioning correctly
3. **Test referral flow**: End-to-end testing of the referral process

### UI Improvements

1. **Dashboard explanation**: Add clear instructions on how referrals work
2. **Referral status**: Show users their referral history and pending referrals
3. **Point breakdown**: Display how points were calculated (base + multipliers)

### Analytics

1. **Referral conversion tracking**: Monitor referral link clicks vs. successful signups
2. **Phase transition planning**: Prepare for changes between signup phases
3. **Point economics**: Analyze point distribution and user engagement

---

## Action Items

- [ ] **Locate source table**: Find the original table James referenced with actual point values
- [ ] **Verify implementation**: Review `PointAllocationService` and related code
- [ ] **Document actual values**: Replace TBD entries with real point allocations
- [ ] **Test current system**: Verify referral system is working as of January 2025
- [ ] **Update dashboard**: Add explanatory text for referral system

---

*This document will be updated once the actual implementation details are verified from the codebase.*