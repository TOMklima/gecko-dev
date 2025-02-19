/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "AuthrsBridge_ffi.h"
#include "WebAuthnResult.h"
#include "nsIWebAuthnAttObj.h"
#include "nsCOMPtr.h"
#include "nsString.h"

#ifdef MOZ_WIDGET_ANDROID
namespace mozilla::jni {

template <>
RefPtr<dom::WebAuthnRegisterResult> Java2Native(
    mozilla::jni::Object::Param aData, JNIEnv* aEnv) {
  MOZ_ASSERT(
      aData.IsInstanceOf<java::WebAuthnTokenManager::MakeCredentialResponse>());
  java::WebAuthnTokenManager::MakeCredentialResponse::LocalRef response(aData);
  RefPtr<dom::WebAuthnRegisterResult> result =
      new dom::WebAuthnRegisterResult(response);
  return result;
}

template <>
RefPtr<dom::WebAuthnSignResult> Java2Native(mozilla::jni::Object::Param aData,
                                            JNIEnv* aEnv) {
  MOZ_ASSERT(
      aData.IsInstanceOf<java::WebAuthnTokenManager::GetAssertionResponse>());
  java::WebAuthnTokenManager::GetAssertionResponse::LocalRef response(aData);
  RefPtr<dom::WebAuthnSignResult> result =
      new dom::WebAuthnSignResult(response);
  return result;
}

}  // namespace mozilla::jni
#endif

namespace mozilla::dom {

NS_IMPL_ISUPPORTS(WebAuthnRegisterResult, nsIWebAuthnRegisterResult)

NS_IMETHODIMP
WebAuthnRegisterResult::GetClientDataJSON(nsACString& aClientDataJSON) {
  aClientDataJSON = mClientDataJSON;
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnRegisterResult::GetAttestationObject(
    nsTArray<uint8_t>& aAttestationObject) {
  aAttestationObject.Assign(mAttestationObject);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnRegisterResult::GetCredentialId(nsTArray<uint8_t>& aCredentialId) {
  aCredentialId.Assign(mCredentialId);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnRegisterResult::GetTransports(nsTArray<nsString>& aTransports) {
  aTransports.Assign(mTransports);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnRegisterResult::GetHmacCreateSecret(bool* aHmacCreateSecret) {
  if (mHmacCreateSecret.isSome()) {
    *aHmacCreateSecret = mHmacCreateSecret.ref();
    return NS_OK;
  }
  return NS_ERROR_NOT_AVAILABLE;
}

NS_IMETHODIMP
WebAuthnRegisterResult::GetCredPropsRk(bool* aCredPropsRk) {
  if (mCredPropsRk.isSome()) {
    *aCredPropsRk = mCredPropsRk.ref();
    return NS_OK;
  }
  return NS_ERROR_NOT_AVAILABLE;
}

NS_IMETHODIMP
WebAuthnRegisterResult::SetCredPropsRk(bool aCredPropsRk) {
  mCredPropsRk = Some(aCredPropsRk);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnRegisterResult::GetAuthenticatorAttachment(
    nsAString& aAuthenticatorAttachment) {
  if (mAuthenticatorAttachment.isSome()) {
    aAuthenticatorAttachment = mAuthenticatorAttachment.ref();
    return NS_OK;
  }
  return NS_ERROR_NOT_AVAILABLE;
}

nsresult WebAuthnRegisterResult::Anonymize() {
  // The anonymize flag in the nsIWebAuthnAttObj constructor causes the
  // attestation statement to be removed during deserialization. It also
  // causes the AAGUID to be zeroed out. If we can't deserialize the
  // existing attestation, then we can't ensure that it is anonymized, so we
  // act as though the user denied consent and we return NotAllowed.
  nsCOMPtr<nsIWebAuthnAttObj> anonymizedAttObj;
  nsresult rv = authrs_webauthn_att_obj_constructor(
      mAttestationObject,
      /* anonymize */ true, getter_AddRefs(anonymizedAttObj));
  if (NS_FAILED(rv)) {
    return rv;
  }
  mAttestationObject.Clear();
  rv = anonymizedAttObj->GetAttestationObject(mAttestationObject);
  if (NS_FAILED(rv)) {
    return rv;
  }
  return NS_OK;
}

NS_IMPL_ISUPPORTS(WebAuthnSignResult, nsIWebAuthnSignResult)

NS_IMETHODIMP
WebAuthnSignResult::GetClientDataJSON(nsACString& aClientDataJSON) {
  aClientDataJSON = mClientDataJSON;
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::GetAuthenticatorData(
    nsTArray<uint8_t>& aAuthenticatorData) {
  aAuthenticatorData.Assign(mAuthenticatorData);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::GetCredentialId(nsTArray<uint8_t>& aCredentialId) {
  aCredentialId.Assign(mCredentialId);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::GetSignature(nsTArray<uint8_t>& aSignature) {
  aSignature.Assign(mSignature);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::GetUserHandle(nsTArray<uint8_t>& aUserHandle) {
  aUserHandle.Assign(mUserHandle);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::GetUserName(nsACString& aUserName) {
  return NS_ERROR_NOT_AVAILABLE;
}

NS_IMETHODIMP
WebAuthnSignResult::GetUsedAppId(bool* aUsedAppId) {
  if (mUsedAppId.isNothing()) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  *aUsedAppId = mUsedAppId.ref();
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::SetUsedAppId(bool aUsedAppId) {
  mUsedAppId = Some(aUsedAppId);
  return NS_OK;
}

NS_IMETHODIMP
WebAuthnSignResult::GetAuthenticatorAttachment(
    nsAString& aAuthenticatorAttachment) {
  if (mAuthenticatorAttachment.isSome()) {
    aAuthenticatorAttachment = mAuthenticatorAttachment.ref();
    return NS_OK;
  }
  return NS_ERROR_NOT_AVAILABLE;
}

}  // namespace mozilla::dom
