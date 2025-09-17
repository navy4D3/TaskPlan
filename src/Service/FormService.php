<?php
namespace App\Service;

use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormInterface;

class FormService
{
    public function convertFormErrorsToJson(FormInterface $form)
    {
        $errors = $form->getErrors(true);
        $response = [];

        foreach ($errors as $error) {
            $formField = $error->getOrigin(); // champ du formulaire (FormInterface)
            $response[] = [
                'field' => $formField->getName(),
                'message' => $error->getMessage(),
            ];
        }

        return $response;
    }
}