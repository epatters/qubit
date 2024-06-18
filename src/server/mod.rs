mod error;
mod router;

pub use error::*;
pub use http::Extensions;
pub use router::{Router, ServerHandle};

/// Context can be built from request information by implementing the following trait. The
/// extensions are passed in from the request (see [`Extensions`]), which can be added using tower
/// middleware.
#[trait_variant::make(Send)]
pub trait FromRequestExtensions<Ctx>
where
    Self: Sized,
{
    /// Using the provided context and extensions, build a new extension.
    async fn from_request_extensions(ctx: Ctx, extensions: Extensions) -> Result<Self, RpcError>;
}

impl<Ctx: Send> FromRequestExtensions<Ctx> for Ctx {
    async fn from_request_extensions(ctx: Ctx, _extensions: Extensions) -> Result<Self, RpcError> {
        Ok(ctx)
    }
}
