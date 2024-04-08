const deleteProduct = (btn) => {
  const id = btn.parentNode.querySelector('[name=id]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');

  fetch(`/admin/product/${id}`, {
    method: 'DELETE',
    headers: { 'csrf-token': csrf },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log({ res });
      productElement.remove();
    })
    .catch((err) => {
      console.log({ err });
    });
};
